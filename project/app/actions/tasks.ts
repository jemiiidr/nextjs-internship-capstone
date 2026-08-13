"use server"

import { and, asc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireDbUser } from "@/lib/auth"
import { canEditProject, db, getProjectAccess } from "@/lib/db"
import { activities, lists, tasks, users } from "@/lib/db/schema"
import { moveTaskSchema, taskSchema, taskUpdateSchema } from "@/lib/validations"
import { parseLabels, toDateOrNull } from "@/lib/utils"
import type { ActionResult, BoardTask } from "@/types"

function toBoardTask(
	task: typeof tasks.$inferSelect,
	assignee: typeof users.$inferSelect | null = null,
): BoardTask {
	return {
		id: task.id,
		listId: task.listId,
		title: task.title,
		description: task.description,
		assigneeId: task.assigneeId,
		assignee: assignee
			? {
					id: assignee.id,
					name: assignee.name,
					email: assignee.email,
					avatarUrl: assignee.avatarUrl,
				}
			: null,
		priority: task.priority,
		dueDate: task.dueDate?.toISOString() ?? null,
		position: task.position,
		labels: task.labels,
		commentsCount: 0,
		createdAt: task.createdAt.toISOString(),
		updatedAt: task.updatedAt.toISOString(),
	}
}

async function validateEditableList(projectId: string, listId: string, userId: string) {
	const access = await getProjectAccess(projectId, userId)
	if (!access || !canEditProject(access.role)) return null

	const list = await db.query.lists.findFirst({
		where: and(eq(lists.id, listId), eq(lists.projectId, projectId)),
	})
	return list ? { access, list } : null
}

export async function createTaskAction(formData: FormData): Promise<ActionResult<BoardTask>> {
	const user = await requireDbUser()
	const parsed = taskSchema.safeParse({
		projectId: formData.get("projectId"),
		listId: formData.get("listId"),
		title: formData.get("title"),
		description: formData.get("description"),
		priority: formData.get("priority") || "medium",
		dueDate: formData.get("dueDate"),
		assigneeId: formData.get("assigneeId"),
		labels: formData.get("labels"),
	})
	if (!parsed.success) {
		return {
			success: false,
			message: "Please correct the task details.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		}
	}

	const editable = await validateEditableList(parsed.data.projectId, parsed.data.listId, user.id)
	if (!editable) {
		return { success: false, message: "You cannot add a task to this list." }
	}

	if (parsed.data.assigneeId) {
		const member = await db.query.projectMembers.findFirst({
			where: (membership, { and: andQuery, eq: equals }) =>
				andQuery(
					equals(membership.projectId, parsed.data.projectId),
					equals(membership.userId, parsed.data.assigneeId as string),
				),
		})
		if (!member) return { success: false, message: "The assignee must be a project member." }
	}

	const existing = await db
		.select({ position: tasks.position })
		.from(tasks)
		.where(eq(tasks.listId, parsed.data.listId))
		.orderBy(asc(tasks.position))
	const position = existing.length === 0 ? 0 : Math.max(...existing.map((task) => task.position)) + 1

	const [created] = await db
		.insert(tasks)
		.values({
			listId: parsed.data.listId,
			title: parsed.data.title,
			description: parsed.data.description,
			priority: parsed.data.priority,
			dueDate: toDateOrNull(parsed.data.dueDate),
			assigneeId: parsed.data.assigneeId,
			labels: parseLabels(parsed.data.labels),
			position,
		})
		.returning()

	const assignee = created.assigneeId
		? await db.query.users.findFirst({ where: eq(users.id, created.assigneeId) })
		: null

	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: user.id,
		taskId: created.id,
		action: "task_created",
		metadata: { taskTitle: created.title, listName: editable.list.name },
	})

	revalidatePath(`/projects/${parsed.data.projectId}`)
	return { success: true, message: "Task created.", data: toBoardTask(created, assignee ?? null) }
}

export async function updateTaskAction(formData: FormData): Promise<ActionResult<BoardTask>> {
	const user = await requireDbUser()
	const parsed = taskUpdateSchema.safeParse({
		projectId: formData.get("projectId"),
		listId: formData.get("listId"),
		taskId: formData.get("taskId"),
		title: formData.get("title"),
		description: formData.get("description"),
		priority: formData.get("priority") || "medium",
		dueDate: formData.get("dueDate"),
		assigneeId: formData.get("assigneeId"),
		labels: formData.get("labels"),
	})
	if (!parsed.success) {
		return {
			success: false,
			message: "Please correct the task details.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		}
	}

	const editable = await validateEditableList(parsed.data.projectId, parsed.data.listId, user.id)
	if (!editable) return { success: false, message: "You cannot edit this task." }

	const existing = await db.query.tasks.findFirst({ where: eq(tasks.id, parsed.data.taskId) })
	if (!existing) return { success: false, message: "Task not found." }

	const existingList = await db.query.lists.findFirst({
		where: and(eq(lists.id, existing.listId), eq(lists.projectId, parsed.data.projectId)),
	})
	if (!existingList) return { success: false, message: "Task does not belong to this project." }

	if (parsed.data.assigneeId) {
		const member = await db.query.projectMembers.findFirst({
			where: (membership, { and: andQuery, eq: equals }) =>
				andQuery(
					equals(membership.projectId, parsed.data.projectId),
					equals(membership.userId, parsed.data.assigneeId as string),
				),
		})
		if (!member) return { success: false, message: "The assignee must be a project member." }
	}

	const [updated] = await db
		.update(tasks)
		.set({
			listId: parsed.data.listId,
			title: parsed.data.title,
			description: parsed.data.description,
			priority: parsed.data.priority,
			dueDate: toDateOrNull(parsed.data.dueDate),
			assigneeId: parsed.data.assigneeId,
			labels: parseLabels(parsed.data.labels),
			updatedAt: new Date(),
		})
		.where(eq(tasks.id, parsed.data.taskId))
		.returning()

	const assignee = updated.assigneeId
		? await db.query.users.findFirst({ where: eq(users.id, updated.assigneeId) })
		: null
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: user.id,
		taskId: updated.id,
		action: "task_updated",
		metadata: { taskTitle: updated.title },
	})

	revalidatePath(`/projects/${parsed.data.projectId}`)
	return { success: true, message: "Task updated.", data: toBoardTask(updated, assignee ?? null) }
}

async function persistPositions(listId: string, orderedTaskIds: string[]) {
	await Promise.all(
		orderedTaskIds.map((taskId, position) =>
			db.update(tasks).set({ listId, position, updatedAt: new Date() }).where(eq(tasks.id, taskId)),
		),
	)
}

export async function moveTaskAction(input: {
	projectId: string
	taskId: string
	fromListId: string
	toListId: string
	position: number
}): Promise<ActionResult> {
	const user = await requireDbUser()
	const parsed = moveTaskSchema.safeParse(input)
	if (!parsed.success) return { success: false, message: "Invalid move request." }

	const access = await getProjectAccess(parsed.data.projectId, user.id)
	if (!access || !canEditProject(access.role)) {
		return { success: false, message: "You cannot move tasks in this project." }
	}

	const projectLists = await db
		.select({ id: lists.id, name: lists.name })
		.from(lists)
		.where(
			and(
				eq(lists.projectId, parsed.data.projectId),
				inArray(lists.id, [parsed.data.fromListId, parsed.data.toListId]),
			),
		)
	if (!projectLists.some((list) => list.id === parsed.data.fromListId) || !projectLists.some((list) => list.id === parsed.data.toListId)) {
		return { success: false, message: "The source or destination list does not exist." }
	}

	const task = await db.query.tasks.findFirst({ where: eq(tasks.id, parsed.data.taskId) })
	if (!task || task.listId !== parsed.data.fromListId) {
		return { success: false, message: "Task location changed. Refresh and try again." }
	}

	const sourceRows = await db
		.select({ id: tasks.id })
		.from(tasks)
		.where(eq(tasks.listId, parsed.data.fromListId))
		.orderBy(asc(tasks.position))

	if (parsed.data.fromListId === parsed.data.toListId) {
		const ordered = sourceRows.map((row) => row.id).filter((id) => id !== parsed.data.taskId)
		ordered.splice(Math.min(parsed.data.position, ordered.length), 0, parsed.data.taskId)
		await persistPositions(parsed.data.toListId, ordered)
	} else {
		const destinationRows = await db
			.select({ id: tasks.id })
			.from(tasks)
			.where(eq(tasks.listId, parsed.data.toListId))
			.orderBy(asc(tasks.position))
		const sourceOrder = sourceRows.map((row) => row.id).filter((id) => id !== parsed.data.taskId)
		const destinationOrder = destinationRows.map((row) => row.id)
		destinationOrder.splice(
			Math.min(parsed.data.position, destinationOrder.length),
			0,
			parsed.data.taskId,
		)
		await Promise.all([
			persistPositions(parsed.data.fromListId, sourceOrder),
			persistPositions(parsed.data.toListId, destinationOrder),
		])
	}

	const destination = projectLists.find((list) => list.id === parsed.data.toListId)
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: user.id,
		taskId: parsed.data.taskId,
		action: "task_moved",
		metadata: { taskTitle: task.title, toList: destination?.name ?? "another list" },
	})

	revalidatePath(`/projects/${parsed.data.projectId}`)
	return { success: true, message: "Task moved." }
}

export async function deleteTaskAction(projectId: string, taskId: string): Promise<ActionResult> {
	const user = await requireDbUser()
	const access = await getProjectAccess(projectId, user.id)
	if (!access || !canEditProject(access.role)) {
		return { success: false, message: "You cannot delete tasks in this project." }
	}

	const row = await db
		.select({ task: tasks, list: lists })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(tasks.id, taskId), eq(lists.projectId, projectId)))
		.limit(1)
	const match = row[0]
	if (!match) return { success: false, message: "Task not found." }

	await db.delete(tasks).where(eq(tasks.id, taskId))
	await db.insert(activities).values({
		projectId,
		actorId: user.id,
		action: "task_deleted",
		metadata: { taskTitle: match.task.title, listName: match.list.name },
	})
	revalidatePath(`/projects/${projectId}`)
	return { success: true, message: "Task deleted." }
}

export async function bulkDeleteTasksAction(projectId: string, taskIds: string[]): Promise<ActionResult> {
	const user = await requireDbUser()
	const access = await getProjectAccess(projectId, user.id)
	if (!access || !canEditProject(access.role)) {
		return { success: false, message: "You cannot delete tasks in this project." }
	}
	const uniqueTaskIds = Array.from(new Set(taskIds)).slice(0, 100)
	if (uniqueTaskIds.length === 0) return { success: false, message: "Select at least one task." }

	const rows = await db
		.select({ id: tasks.id })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(and(eq(lists.projectId, projectId), inArray(tasks.id, uniqueTaskIds)))
	const permittedIds = rows.map((row) => row.id)
	if (permittedIds.length === 0) return { success: false, message: "No matching tasks were found." }

	await db.delete(tasks).where(inArray(tasks.id, permittedIds))
	await db.insert(activities).values({
		projectId,
		actorId: user.id,
		action: "task_deleted",
		metadata: { taskTitle: `${permittedIds.length} tasks`, bulk: true },
	})
	revalidatePath(`/projects/${projectId}`)
	return { success: true, message: `${permittedIds.length} tasks deleted.` }
}
