"use server"

import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db, canManageProject, getProjectAccess } from "@/lib/db"
import { activities, lists, projectMembers, projects, users } from "@/lib/db/schema"
import { requireDbUser } from "@/lib/auth"
import { memberSchema, projectSchema, projectUpdateSchema } from "@/lib/validations"
import { toDateOrNull } from "@/lib/utils"
import type { ActionResult, ProjectSummary } from "@/types"

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[]> } }) {
	return error.flatten().fieldErrors
}

export async function createProjectAction(formData: FormData): Promise<ActionResult<ProjectSummary>> {
	const user = await requireDbUser()
	const parsed = projectSchema.safeParse({
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
		visibility: formData.get("visibility") || "private",
	})

	if (!parsed.success) {
		return {
			success: false,
			message: "Please correct the highlighted fields.",
			fieldErrors: fieldErrors(parsed.error),
		}
	}

	try {
		const [project] = await db
			.insert(projects)
			.values({
				name: parsed.data.name,
				description: parsed.data.description,
				dueDate: toDateOrNull(parsed.data.dueDate),
				visibility: parsed.data.visibility,
				ownerId: user.id,
			})
			.returning()

		await db.insert(projectMembers).values({
			projectId: project.id,
			userId: user.id,
			role: "owner",
		})
		await db.insert(lists).values([
			{ projectId: project.id, name: "To do", position: 0 },
			{ projectId: project.id, name: "In progress", position: 1 },
			{ projectId: project.id, name: "Done", position: 2 },
		])
		await db.insert(activities).values({
			projectId: project.id,
			actorId: user.id,
			action: "project_created",
			metadata: { projectName: project.name },
		})

		revalidatePath("/dashboard")
		revalidatePath("/projects")

		return {
			success: true,
			message: "Project created.",
			data: {
				id: project.id,
				name: project.name,
				description: project.description,
				dueDate: project.dueDate?.toISOString() ?? null,
				visibility: project.visibility,
				role: "owner",
				memberCount: 1,
				taskCount: 0,
				completedTaskCount: 0,
				updatedAt: project.updatedAt.toISOString(),
			},
		}
	} catch (error) {
		console.error("createProjectAction failed", error)
		return { success: false, message: "The project could not be created. Try again." }
	}
}

export async function updateProjectAction(formData: FormData): Promise<ActionResult> {
	const user = await requireDbUser()
	const parsed = projectUpdateSchema.safeParse({
		projectId: formData.get("projectId"),
		name: formData.get("name"),
		description: formData.get("description"),
		dueDate: formData.get("dueDate"),
		visibility: formData.get("visibility") || "private",
	})
	if (!parsed.success) {
		return { success: false, message: "Invalid project details.", fieldErrors: fieldErrors(parsed.error) }
	}

	const access = await getProjectAccess(parsed.data.projectId, user.id)
	if (!access || !canManageProject(access.role)) {
		return { success: false, message: "You do not have permission to edit this project." }
	}

	await db
		.update(projects)
		.set({
			name: parsed.data.name,
			description: parsed.data.description,
			dueDate: toDateOrNull(parsed.data.dueDate),
			visibility: parsed.data.visibility,
			updatedAt: new Date(),
		})
		.where(eq(projects.id, parsed.data.projectId))
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: user.id,
		action: "project_updated",
		metadata: { projectName: parsed.data.name },
	})

	revalidatePath("/dashboard")
	revalidatePath("/projects")
	revalidatePath(`/projects/${parsed.data.projectId}`)
	return { success: true, message: "Project updated." }
}

export async function deleteProjectAction(projectId: string): Promise<ActionResult> {
	const user = await requireDbUser()
	const access = await getProjectAccess(projectId, user.id)
	if (!access) return { success: false, message: "Project not found." }

	if (access.role !== "owner") {
		return { success: false, message: "Only the project owner can delete this project." }
	}
	await db.delete(projects).where(eq(projects.id, projectId))
	revalidatePath("/dashboard")
	revalidatePath("/projects")
	return { success: true, message: "Project deleted." }
}

export async function addProjectMemberAction(formData: FormData): Promise<ActionResult> {
	const currentUser = await requireDbUser()
	const parsed = memberSchema.safeParse({
		projectId: formData.get("projectId"),
		userId: formData.get("userId"),
		role: formData.get("role") || "member",
	})
	if (!parsed.success) {
		return { success: false, message: "Choose a valid user and role.", fieldErrors: fieldErrors(parsed.error) }
	}

	const access = await getProjectAccess(parsed.data.projectId, currentUser.id)
	if (!access || !canManageProject(access.role)) {
		return { success: false, message: "You do not have permission to manage members." }
	}

	const targetUser = await db.query.users.findFirst({ where: eq(users.id, parsed.data.userId) })
	if (!targetUser) return { success: false, message: "User not found. Ask them to sign in once first." }

	await db
		.insert(projectMembers)
		.values(parsed.data)
		.onConflictDoUpdate({
			target: [projectMembers.projectId, projectMembers.userId],
			set: { role: parsed.data.role },
		})
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: currentUser.id,
		action: "project_member_added",
		metadata: { memberName: targetUser.name, role: parsed.data.role },
	})

	revalidatePath(`/projects/${parsed.data.projectId}`)
	revalidatePath("/team")
	return { success: true, message: `${targetUser.name} was added to the project.` }
}

export async function removeProjectMemberAction(projectId: string, userId: string): Promise<ActionResult> {
	const currentUser = await requireDbUser()
	const access = await getProjectAccess(projectId, currentUser.id)
	if (!access || !canManageProject(access.role)) {
		return { success: false, message: "You do not have permission to manage members." }
	}

	const membership = await db.query.projectMembers.findFirst({
		where: and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)),
	})
	if (!membership) return { success: false, message: "Membership not found." }
	if (membership.role === "owner") return { success: false, message: "The project owner cannot be removed." }

	const targetUser = await db.query.users.findFirst({ where: eq(users.id, userId) })
	await db
		.delete(projectMembers)
		.where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.userId, userId)))
	await db.insert(activities).values({
		projectId,
		actorId: currentUser.id,
		action: "project_member_removed",
		metadata: { memberName: targetUser?.name ?? "Member" },
	})

	revalidatePath(`/projects/${projectId}`)
	revalidatePath("/team")
	return { success: true, message: "Member removed." }
}

export async function getProjectMembersForAction(projectId: string) {
	const user = await requireDbUser()
	const access = await getProjectAccess(projectId, user.id)
	if (!access) return []

	return db
		.select({ membership: projectMembers, user: users })
		.from(projectMembers)
		.innerJoin(users, eq(projectMembers.userId, users.id))
		.where(eq(projectMembers.projectId, projectId))
		.orderBy(asc(users.name))
}
