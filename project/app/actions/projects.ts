"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
	canEditProject,
	canManageProject,
	requireProjectAccess,
	requireWorkspaceContext,
} from "@/lib/auth";
import { db } from "@/lib/db";
import {
	activities,
	lists,
	projectMembers,
	projects,
	users,
} from "@/lib/db/schema";
import { toDateOrNull } from "@/lib/utils";
import {
	memberSchema,
	projectSchema,
	projectUpdateSchema,
} from "@/lib/validations";
import { getWorkspaceMembers } from "@/lib/workspaces";
import type { ActionResult, ProjectSummary } from "@/types";

function fieldErrors(error: {
	flatten: () => { fieldErrors: Record<string, string[]> };
}) {
	return error.flatten().fieldErrors;
}

function revalidateProjectSurfaces(projectId?: string) {
	revalidatePath("/dashboard");
	revalidatePath("/projects");
	revalidatePath("/workspaces");
	revalidatePath("/analytics");
	revalidatePath("/my-tasks");
	revalidatePath("/calendar");
	if (projectId) revalidatePath(`/projects/${projectId}`);
}

export async function createProjectAction(
	formData: FormData,
): Promise<ActionResult<ProjectSummary>> {
	const context = await requireWorkspaceContext();
	if (!canEditProject(context.role)) {
		return { success: false, message: "Viewers cannot create projects." };
	}
	const parsed = projectSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
		visibility: "workspace",
	});

	if (!parsed.success) {
		return {
			success: false,
			message: "Please correct the highlighted fields.",
			fieldErrors: fieldErrors(parsed.error),
		};
	}

	try {
		const [project] = await db
			.insert(projects)
			.values({
				name: parsed.data.name,
				description: parsed.data.description,
				dueDate: toDateOrNull(parsed.data.dueDate),
				visibility: "workspace",
				ownerId: context.user.id,
				workspaceId: context.workspaceId,
			})
			.returning();

		await db.insert(projectMembers).values({
			projectId: project.id,
			userId: context.user.id,
			role: context.role,
			roleLabel: "Owner",
		});
		await db.insert(lists).values([
			{ projectId: project.id, name: "To Do", position: 0 },
			{ projectId: project.id, name: "In Progress", position: 1 },
			{ projectId: project.id, name: "In Review", position: 2 },
			{ projectId: project.id, name: "Done", position: 3 },
			{ projectId: project.id, name: "Blocked", position: 4 },
		]);
		await db.insert(activities).values({
			projectId: project.id,
			actorId: context.user.id,
			action: "project_created",
			metadata: { projectName: project.name },
		});

		revalidateProjectSurfaces(project.id);
		return {
			success: true,
			message: "Project created in the active workspace.",
			data: {
				id: project.id,
				workspaceId: project.workspaceId,
				name: project.name,
				description: project.description,
				iconDataUrl: project.iconDataUrl,
				dueDate: project.dueDate?.toISOString() ?? null,
				visibility: project.visibility,
				role: context.role,
				isOwner: true,
				memberCount: 1,
				members: [
					{
						id: context.user.id,
						name: context.user.name,
						email: context.user.email,
						avatarUrl: context.user.avatarUrl,
					},
				],
				taskCount: 0,
				completedTaskCount: 0,
				updatedAt: project.updatedAt.toISOString(),
			},
		};
	} catch (error) {
		console.error("createProjectAction failed", error);
		return {
			success: false,
			message: "The project could not be created. Try again.",
		};
	}
}

export async function updateProjectAction(
	formData: FormData,
): Promise<ActionResult> {
	const parsed = projectUpdateSchema.safeParse({
		projectId: formData.get("projectId"),
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
		visibility: "workspace",
	});
	if (!parsed.success) {
		return {
			success: false,
			message: "Invalid project details.",
			fieldErrors: fieldErrors(parsed.error),
		};
	}

	const access = await requireProjectAccess(parsed.data.projectId);
	if (!access || !canManageProject(access.role)) {
		return {
			success: false,
			message: "You do not have permission to edit this project.",
		};
	}
	const icon = formData.get("icon");
	let iconDataUrl: string | undefined;
	if (icon instanceof File && icon.size > 0) {
		if (!icon.type.startsWith("image/") || icon.size > 512 * 1024) {
			return {
				success: false,
				message: "Project icons must be image files no larger than 512KB.",
			};
		}
		iconDataUrl = `data:${icon.type};base64,${Buffer.from(await icon.arrayBuffer()).toString("base64")}`;
	}

	await db
		.update(projects)
		.set({
			name: parsed.data.name,
			description: parsed.data.description,
			dueDate: toDateOrNull(parsed.data.dueDate),
			...(iconDataUrl ? { iconDataUrl } : {}),
			updatedAt: new Date(),
		})
		.where(eq(projects.id, parsed.data.projectId));
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: access.user.id,
		action: "project_updated",
		metadata: { projectName: parsed.data.name },
	});

	revalidateProjectSurfaces(parsed.data.projectId);
	return { success: true, message: "Project updated." };
}

export async function deleteProjectAction(
	projectId: string,
): Promise<ActionResult> {
	const access = await requireProjectAccess(projectId);
	if (!access) return { success: false, message: "Project not found." };
	if (!canManageProject(access.role)) {
		return {
			success: false,
			message: "Only workspace admins can delete projects.",
		};
	}
	await db.delete(projects).where(eq(projects.id, projectId));
	revalidateProjectSurfaces();
	return { success: true, message: "Project deleted." };
}

export async function addProjectMemberAction(
	formData: FormData,
): Promise<ActionResult> {
	const parsed = memberSchema.safeParse({
		projectId: formData.get("projectId"),
		userId: formData.get("userId"),
	});
	if (!parsed.success) {
		return {
			success: false,
			message: "Choose a valid workspace member.",
			fieldErrors: fieldErrors(parsed.error),
		};
	}

	const access = await requireProjectAccess(parsed.data.projectId);
	if (!access || !canManageProject(access.role) || !access.workspaceId) {
		return {
			success: false,
			message: "Only workspace admins can manage project collaborators.",
		};
	}
	const roleLabel =
		String(formData.get("roleLabel") ?? "Contributor")
			.trim()
			.slice(0, 40) || "Contributor";

	const workspaceMembers = await getWorkspaceMembers(access.workspaceId);
	const target = workspaceMembers.find(
		(member) => member.id === parsed.data.userId,
	);
	if (!target) {
		return {
			success: false,
			message: "That user is not a member of the active Clerk workspace.",
		};
	}

	await db
		.insert(projectMembers)
		.values({
			projectId: parsed.data.projectId,
			userId: target.id,
			role: target.role,
			roleLabel,
		})
		.onConflictDoUpdate({
			target: [projectMembers.projectId, projectMembers.userId],
			set: { role: target.role, roleLabel },
		});
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: access.user.id,
		action: "project_member_added",
		metadata: { memberName: target.name, role: roleLabel },
	});

	revalidateProjectSurfaces(parsed.data.projectId);
	return {
		success: true,
		message: `${target.name} was added as a collaborator.`,
	};
}

export async function updateProjectMemberLabelAction(
	formData: FormData,
): Promise<ActionResult> {
	const projectId = String(formData.get("projectId") ?? "");
	const userId = String(formData.get("userId") ?? "");
	const roleLabel = String(formData.get("roleLabel") ?? "")
		.trim()
		.slice(0, 40);
	const access = await requireProjectAccess(projectId);
	if (!access || !canManageProject(access.role))
		return {
			success: false,
			message: "Only project admins can change role labels.",
		};
	if (!roleLabel)
		return { success: false, message: "Choose or enter a role label." };
	await db
		.update(projectMembers)
		.set({ roleLabel })
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		);
	revalidateProjectSurfaces(projectId);
	return { success: true, message: "Project role updated." };
}

export async function removeProjectMemberAction(
	projectId: string,
	userId: string,
): Promise<ActionResult> {
	const access = await requireProjectAccess(projectId);
	if (!access || !canManageProject(access.role)) {
		return {
			success: false,
			message: "Only workspace admins can manage project collaborators.",
		};
	}
	if (access.project.ownerId === userId) {
		return {
			success: false,
			message: "The project creator cannot be removed.",
		};
	}

	const targetUser = await db.query.users.findFirst({
		where: eq(users.id, userId),
	});
	await db
		.delete(projectMembers)
		.where(
			and(
				eq(projectMembers.projectId, projectId),
				eq(projectMembers.userId, userId),
			),
		);
	await db.insert(activities).values({
		projectId,
		actorId: access.user.id,
		action: "project_member_removed",
		metadata: { memberName: targetUser?.name ?? "Member" },
	});

	revalidateProjectSurfaces(projectId);
	return { success: true, message: "Collaborator removed." };
}

export async function getProjectMembersForAction(projectId: string) {
	const access = await requireProjectAccess(projectId);
	if (!access) return [];
	return db
		.select({ membership: projectMembers, user: users })
		.from(projectMembers)
		.innerJoin(users, eq(projectMembers.userId, users.id))
		.where(eq(projectMembers.projectId, projectId))
		.orderBy(asc(users.name));
}
