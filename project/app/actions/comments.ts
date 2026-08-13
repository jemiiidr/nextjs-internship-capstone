"use server"

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireDbUser } from "@/lib/auth"
import { canEditProject, db, getProjectAccess, getTaskComments } from "@/lib/db"
import { activities, comments, lists, tasks } from "@/lib/db/schema"
import { commentSchema } from "@/lib/validations"
import type { ActionResult, TaskComment } from "@/types"

export async function getTaskCommentsAction(
	projectId: string,
	taskId: string,
): Promise<ActionResult<TaskComment[]>> {
	const user = await requireDbUser()
	const access = await getProjectAccess(projectId, user.id)
	if (!access) return { success: false, message: "Project not found." }
	const task = await db
		.select({ id: tasks.id })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), eq(lists.projectId, projectId)))
		.limit(1)
	if (!task[0]) return { success: false, message: "Task not found." }

	return {
		success: true,
		message: "Comments loaded.",
		data: await getTaskComments(taskId, projectId, user.id),
	}
}

export async function addCommentAction(formData: FormData): Promise<ActionResult<TaskComment>> {
	const user = await requireDbUser()
	const parsed = commentSchema.safeParse({
		projectId: formData.get("projectId"),
		taskId: formData.get("taskId"),
		content: formData.get("content"),
	})
	if (!parsed.success) {
		return {
			success: false,
			message: "Write a comment before submitting.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		}
	}

	const access = await getProjectAccess(parsed.data.projectId, user.id)
	if (!access || !canEditProject(access.role)) {
		return { success: false, message: "You cannot comment on this project." }
	}
	const task = await db
		.select({ id: tasks.id, title: tasks.title })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, parsed.data.taskId), eq(lists.projectId, parsed.data.projectId)))
		.limit(1)
	if (!task[0]) return { success: false, message: "Task not found." }

	const [created] = await db
		.insert(comments)
		.values({ taskId: parsed.data.taskId, authorId: user.id, content: parsed.data.content })
		.returning()
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: user.id,
		taskId: parsed.data.taskId,
		action: "comment_created",
		metadata: { taskTitle: task[0].title },
	})

	revalidatePath(`/projects/${parsed.data.projectId}`)
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
				id: user.id,
				name: user.name,
				email: user.email,
				avatarUrl: user.avatarUrl,
			},
		},
	}
}
