import "server-only";

import {
	and,
	count,
	desc,
	eq,
	inArray,
	isNull,
	lte,
	notInArray,
} from "drizzle-orm";
import { db } from "@/lib/db";
import { lists, notifications, projects, tasks } from "@/lib/db/schema";
import type { NotificationItem } from "@/types";

export async function createNotification(input: {
	recipientId: string;
	workspaceId: string;
	projectId?: string;
	taskId?: string;
	type: typeof notifications.$inferInsert.type;
	title: string;
	message: string;
	href: string;
	eventKey: string;
}) {
	await db.insert(notifications).values(input).onConflictDoNothing();
}

async function ensureDeadlineNotifications(input: {
	userId: string;
	workspaceId: string;
}) {
	const now = new Date();
	const endOfToday = new Date(now);
	endOfToday.setHours(23, 59, 59, 999);
	const assigned = await db
		.select({
			taskId: tasks.id,
			title: tasks.title,
			dueDate: tasks.dueDate,
			projectId: projects.id,
			projectName: projects.name,
			listName: lists.name,
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(tasks.assigneeId, input.userId),
				eq(projects.workspaceId, input.workspaceId),
				lte(tasks.dueDate, endOfToday),
				notInArray(lists.name, [
					"Done",
					"Complete",
					"Completed",
					"done",
					"complete",
					"completed",
				]),
			),
		);

	for (const task of assigned) {
		if (!task.dueDate) continue;
		const overdue =
			task.dueDate.getTime() < new Date(now.toDateString()).getTime();
		await createNotification({
			recipientId: input.userId,
			workspaceId: input.workspaceId,
			projectId: task.projectId,
			taskId: task.taskId,
			type: overdue ? "task_overdue" : "deadline_today",
			title: overdue ? "Task overdue" : "Task due today",
			message: `${task.title} in ${task.projectName} ${overdue ? "is overdue" : "is due today"}.`,
			href: `/projects/${task.projectId}`,
			eventKey: `${overdue ? "overdue" : "due-today"}:${task.taskId}:${task.dueDate.toISOString()}`,
		});
	}
}

async function ensureAssignmentNotifications(input: {
	userId: string;
	workspaceId: string;
}) {
	const assigned = await db
		.select({
			taskId: tasks.id,
			title: tasks.title,
			projectId: projects.id,
			projectName: projects.name,
		})
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				eq(tasks.assigneeId, input.userId),
				eq(projects.workspaceId, input.workspaceId),
			),
		);
	if (assigned.length === 0) return;

	const taskIds = assigned.map((task) => task.taskId);
	const existing = await db
		.select({ taskId: notifications.taskId })
		.from(notifications)
		.where(
			and(
				eq(notifications.recipientId, input.userId),
				inArray(notifications.taskId, taskIds),
				inArray(notifications.type, ["task_assigned", "task_reassigned"]),
			),
		);
	const notifiedTaskIds = new Set(existing.map((row) => row.taskId));

	await Promise.all(
		assigned
			.filter((task) => !notifiedTaskIds.has(task.taskId))
			.map((task) =>
				createNotification({
					recipientId: input.userId,
					workspaceId: input.workspaceId,
					projectId: task.projectId,
					taskId: task.taskId,
					type: "task_assigned",
					title: "Task assigned to you",
					message: `You are assigned to “${task.title}” in ${task.projectName}.`,
					href: `/projects/${task.projectId}`,
					eventKey: `assignment-reconciled:${task.taskId}:${input.userId}`,
				}),
			),
	);
}

export async function getUserNotifications(input: {
	userId: string;
	workspaceId: string | null;
	limit?: number;
	page?: number;
}): Promise<{
	items: NotificationItem[];
	unreadCount: number;
	totalCount: number;
}> {
	if (input.workspaceId)
		await Promise.all([
			ensureAssignmentNotifications({
				userId: input.userId,
				workspaceId: input.workspaceId,
			}),
			ensureDeadlineNotifications({
				userId: input.userId,
				workspaceId: input.workspaceId,
			}),
		]);
	const scope = and(
		eq(notifications.recipientId, input.userId),
		input.workspaceId
			? eq(notifications.workspaceId, input.workspaceId)
			: undefined,
	);
	const limit = Math.min(Math.max(input.limit ?? 30, 1), 100);
	const page = Math.max(input.page ?? 1, 1);
	const [rows, unread, total] = await Promise.all([
		db
			.select()
			.from(notifications)
			.where(scope)
			.orderBy(desc(notifications.createdAt))
			.limit(limit)
			.offset((page - 1) * limit),
		db
			.select({ value: count() })
			.from(notifications)
			.where(and(scope, isNull(notifications.readAt))),
		db.select({ value: count() }).from(notifications).where(scope),
	]);
	return {
		items: rows.map((row) => ({
			id: row.id,
			type: row.type,
			title: row.title,
			message: row.message,
			href: row.href,
			read: row.readAt !== null,
			createdAt: row.createdAt.toISOString(),
		})),
		unreadCount: unread[0]?.value ?? 0,
		totalCount: total[0]?.value ?? 0,
	};
}
