"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canEditProject, requireProjectAccess } from "@/lib/auth";
import { db, getTaskComments } from "@/lib/db";
import { activities, comments, lists, tasks } from "@/lib/db/schema";
import { commentSchema } from "@/lib/validations";
import type { ActionResult, TaskComment } from "@/types";

export async function getTaskCommentsAction(
	projectId: string,
	taskId: string,
): Promise<ActionResult<TaskComment[]>> {
	const access = await requireProjectAccess(projectId);
	if (!access) return { success: false, message: "Project not found." };
	const task = await db
		.select({ id: tasks.id })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), eq(lists.projectId, projectId)))
		.limit(1);
	if (!task[0]) return { success: false, message: "Task not found." };

	return {
		success: true,
		message: "Comments loaded.",
		data: await getTaskComments(taskId, projectId, {
			userId: access.user.id,
			workspaceId: access.workspaceId,
			role: access.role,
		}),
	};
}

export async function addCommentAction(
	formData: FormData,
): Promise<ActionResult<TaskComment>> {
	const parsed = commentSchema.safeParse({
		projectId: formData.get("projectId"),
		taskId: formData.get("taskId"),
		content: formData.get("content"),
	});
	if (!parsed.success) {
		return {
			success: false,
			message: "Write a comment before submitting.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		};
	}

	const access = await requireProjectAccess(parsed.data.projectId);
	if (!access || !canEditProject(access.role)) {
		return { success: false, message: "You cannot comment on this project." };
	}
	const task = await db
		.select({ id: tasks.id, title: tasks.title })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(
			and(
				eq(tasks.id, parsed.data.taskId),
				eq(lists.projectId, parsed.data.projectId),
			),
		)
		.limit(1);
	if (!task[0]) return { success: false, message: "Task not found." };

	const [created] = await db
		.insert(comments)
		.values({
			taskId: parsed.data.taskId,
			authorId: access.user.id,
			content: parsed.data.content,
		})
		.returning();
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: access.user.id,
		taskId: parsed.data.taskId,
		action: "comment_created",
		metadata: { taskTitle: task[0].title },
	});

	revalidatePath(`/projects/${parsed.data.projectId}`);
	return {
		success: true,
		message: "Comment added.",
		data: {
			id: created.id,
			taskId: created.taskId,
			content: created.content,
			createdAt: created.createdAt.toISOString(),
			updatedAt: created.updatedAt.toISOString(),
			author: {
				id: access.user.id,
				name: access.user.name,
				email: access.user.email,
				avatarUrl: access.user.avatarUrl,
			},
		},
	};
}
