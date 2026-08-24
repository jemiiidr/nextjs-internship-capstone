import "server-only";

import {
	and,
	asc,
	count,
	desc,
	eq,
	gte,
	ilike,
	inArray,
	isNull,
	or,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type {
	ActivityItem,
	AnalyticsData,
	BoardList,
	BoardTask,
	MemberRole,
	MyTaskItem,
	ProjectBoardData,
	ProjectMember,
	ProjectSummary,
	TaskComment,
	UserSummary,
} from "@/types";
import * as schema from "./schema";
import {
	activities,
	comments,
	lists,
	projectMembers,
	projects,
	tasks,
	users,
} from "./schema";

const connectionString =
	process.env.DATABASE_URL ??
	"postgresql://local:local@127.0.0.1:5432/projectflow";

export const db = drizzle(connectionString, { schema });

function serializeUser(user: typeof users.$inferSelect): UserSummary {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		avatarUrl: user.avatarUrl,
	};
}

function isCompletedList(name: string) {
	return ["done", "complete", "completed"].includes(name.trim().toLowerCase());
}

function isInProgressList(name: string) {
	return ["in progress", "doing", "active"].includes(name.trim().toLowerCase());
}

export async function findUserByClerkId(clerkId: string) {
	return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
}

export async function getWorkspaceProjectCounts(workspaceIds: string[]) {
	if (workspaceIds.length === 0) return {} as Record<string, number>;
	const rows = await db
		.select({ workspaceId: projects.workspaceId, total: count(projects.id) })
		.from(projects)
		.where(inArray(projects.workspaceId, workspaceIds))
		.groupBy(projects.workspaceId);

	return Object.fromEntries(
		rows.flatMap((row) =>
			row.workspaceId ? [[row.workspaceId, Number(row.total)] as const] : [],
		),
	);
}

function projectScopeCondition(input: {
	userId: string;
	workspaceId: string | null;
}) {
	if (input.workspaceId) return eq(projects.workspaceId, input.workspaceId);
	return and(eq(projects.ownerId, input.userId), isNull(projects.workspaceId));
}

export async function getProjectAccess(
	projectId: string,
	input: {
		userId: string;
		workspaceId: string | null;
		role: MemberRole;
	},
) {
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId),
	});
	if (!project) return null;
	if (project.workspaceId) {
		if (!input.workspaceId || project.workspaceId !== input.workspaceId)
			return null;
		return {
			project,
			role: input.role,
			isOwner: project.ownerId === input.userId,
		};
	}
	return null;
}

export function canManageProject(role: MemberRole) {
	return role === "owner" || role === "admin";
}

export function canEditProject(role: MemberRole) {
	return role !== "viewer";
}

export async function getProjectsForUser(input: {
	userId: string;
	workspaceId: string | null;
	role: MemberRole;
	search?: string;
}): Promise<ProjectSummary[]> {
	const normalizedSearch = input.search?.trim() ?? "";
	const scope = projectScopeCondition(input);
	const whereCondition = normalizedSearch
		? and(scope, ilike(projects.name, `%${normalizedSearch}%`))
		: scope;

	const projectRows = await db
		.select()
		.from(projects)
		.where(whereCondition)
		.orderBy(desc(projects.updatedAt));

	const projectIds = projectRows.map((project) => project.id);
	if (projectIds.length === 0) return [];

	const [memberRows, taskRows] = await Promise.all([
		db
			.select({ projectId: projectMembers.projectId, user: users })
			.from(projectMembers)
			.innerJoin(users, eq(projectMembers.userId, users.id))
			.where(inArray(projectMembers.projectId, projectIds))
			.orderBy(asc(projectMembers.createdAt)),
		db
			.select({
				projectId: lists.projectId,
				taskId: tasks.id,
				listName: lists.name,
			})
			.from(lists)
			.leftJoin(tasks, eq(tasks.listId, lists.id))
			.where(inArray(lists.projectId, projectIds)),
	]);

	const memberMap = new Map<string, UserSummary[]>();
	for (const row of memberRows) {
		const current = memberMap.get(row.projectId) ?? [];
		if (!current.some((member) => member.id === row.user.id)) {
			current.push(serializeUser(row.user));
		}
		memberMap.set(row.projectId, current);
	}

	const taskCounts = new Map<string, { total: number; completed: number }>();
	for (const row of taskRows) {
		if (!row.taskId) continue;
		const current = taskCounts.get(row.projectId) ?? { total: 0, completed: 0 };
		current.total += 1;
		if (isCompletedList(row.listName)) current.completed += 1;
		taskCounts.set(row.projectId, current);
	}

	return projectRows.map((project) => {
		const counts = taskCounts.get(project.id) ?? { total: 0, completed: 0 };
		const projectMemberList = memberMap.get(project.id) ?? [];
		return {
			id: project.id,
			workspaceId: project.workspaceId,
			name: project.name,
			description: project.description,
			dueDate: project.dueDate?.toISOString() ?? null,
			visibility: project.visibility,
			role: project.workspaceId ? input.role : "owner",
			isOwner: project.ownerId === input.userId,
			memberCount: projectMemberList.length || 1,
			members: projectMemberList.slice(0, 4),
			taskCount: counts.total,
			completedTaskCount: counts.completed,
			updatedAt: project.updatedAt.toISOString(),
		};
	});
}

export async function getDashboardData(input: {
	userId: string;
	workspaceId: string | null;
	role: MemberRole;
}) {
	const projectSummaries = await getProjectsForUser(input);
	const totalTasks = projectSummaries.reduce(
		(sum, project) => sum + project.taskCount,
		0,
	);
	const completedTasks = projectSummaries.reduce(
		(sum, project) => sum + project.completedTaskCount,
		0,
	);
	const dueSoon = projectSummaries.filter((project) => {
		if (!project.dueDate) return false;
		const difference = new Date(project.dueDate).getTime() - Date.now();
		return difference >= 0 && difference <= 1000 * 60 * 60 * 24 * 7;
	}).length;

	return {
		projects: projectSummaries.slice(0, 4),
		stats: {
			projectCount: projectSummaries.length,
			totalTasks,
			completedTasks,
			dueSoon,
		},
	};
}

export async function getProjectBoard(
	projectId: string,
	input: { userId: string; workspaceId: string | null; role: MemberRole },
): Promise<ProjectBoardData | null> {
	const access = await getProjectAccess(projectId, input);
	if (!access) return null;

	const listRows = await db
		.select()
		.from(lists)
		.where(eq(lists.projectId, projectId))
		.orderBy(asc(lists.position));

	const listIds = listRows.map((list) => list.id);
	const taskRows =
		listIds.length === 0
			? []
			: await db
					.select({ task: tasks, assignee: users })
					.from(tasks)
					.leftJoin(users, eq(tasks.assigneeId, users.id))
					.where(inArray(tasks.listId, listIds))
					.orderBy(asc(tasks.position));

	const taskIds = taskRows.map((row) => row.task.id);
	const commentRows =
		taskIds.length === 0
			? []
			: await db
					.select({ taskId: comments.taskId, id: comments.id })
					.from(comments)
					.where(inArray(comments.taskId, taskIds));
	const commentCounts = new Map<string, number>();
	for (const row of commentRows) {
		commentCounts.set(row.taskId, (commentCounts.get(row.taskId) ?? 0) + 1);
	}

	const memberRows = await db
		.select({ membership: projectMembers, user: users })
		.from(projectMembers)
		.innerJoin(users, eq(projectMembers.userId, users.id))
		.where(eq(projectMembers.projectId, projectId))
		.orderBy(asc(users.name));

	const activityRows = await db
		.select({ activity: activities, actor: users })
		.from(activities)
		.innerJoin(users, eq(activities.actorId, users.id))
		.where(eq(activities.projectId, projectId))
		.orderBy(desc(activities.createdAt))
		.limit(20);

	const boardLists: BoardList[] = listRows.map((list) => ({
		id: list.id,
		projectId: list.projectId,
		name: list.name,
		position: list.position,
	}));

	const boardTasks: BoardTask[] = taskRows.map(({ task, assignee }) => ({
		id: task.id,
		listId: task.listId,
		title: task.title,
		description: task.description,
		assigneeId: task.assigneeId,
		assignee: assignee ? serializeUser(assignee) : null,
		priority: task.priority,
		dueDate: task.dueDate?.toISOString() ?? null,
		position: task.position,
		labels: task.labels,
		commentsCount: commentCounts.get(task.id) ?? 0,
		createdAt: task.createdAt.toISOString(),
		updatedAt: task.updatedAt.toISOString(),
	}));

	const members: ProjectMember[] = memberRows.map(({ membership, user }) => ({
		projectId: membership.projectId,
		role: user.id === access.project.ownerId ? "owner" : membership.role,
		user: serializeUser(user),
	}));

	const activityItems: ActivityItem[] = activityRows.map(
		({ activity, actor }) => ({
			id: activity.id,
			action: activity.action,
			metadata: activity.metadata,
			createdAt: activity.createdAt.toISOString(),
			actor: serializeUser(actor),
		}),
	);

	return {
		project: {
			id: access.project.id,
			workspaceId: access.project.workspaceId,
			name: access.project.name,
			description: access.project.description,
			dueDate: access.project.dueDate?.toISOString() ?? null,
			visibility: access.project.visibility,
			role: access.role,
			isOwner: access.isOwner,
		},
		lists: boardLists,
		tasks: boardTasks,
		members,
		activities: activityItems,
	};
}

export async function getTaskComments(
	taskId: string,
	projectId: string,
	input: { userId: string; workspaceId: string | null; role: MemberRole },
): Promise<TaskComment[]> {
	const access = await getProjectAccess(projectId, input);
	if (!access) return [];

	const rows = await db
		.select({ comment: comments, author: users })
		.from(comments)
		.innerJoin(users, eq(comments.authorId, users.id))
		.where(eq(comments.taskId, taskId))
		.orderBy(asc(comments.createdAt));

	return rows.map(({ comment, author }) => ({
		id: comment.id,
		taskId: comment.taskId,
		content: comment.content,
		createdAt: comment.createdAt.toISOString(),
		updatedAt: comment.updatedAt.toISOString(),
		author: serializeUser(author),
	}));
}

export async function getCalendarTasks(input: {
	userId: string;
	workspaceId: string | null;
	role: MemberRole;
}) {
	const accessibleProjects = await getProjectsForUser(input);
	const projectIds = accessibleProjects.map((project) => project.id);
	if (projectIds.length === 0) return [];

	const rows = await db
		.select({ task: tasks, project: projects, list: lists })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(
				inArray(projects.id, projectIds),
				or(
					eq(tasks.assigneeId, input.userId),
					eq(projects.ownerId, input.userId),
				),
			),
		)
		.orderBy(asc(tasks.dueDate));

	return rows.map(({ task, project, list }) => ({
		id: task.id,
		title: task.title,
		priority: task.priority,
		dueDate: task.dueDate?.toISOString() ?? null,
		projectId: project.id,
		projectName: project.name,
		listName: list.name,
	}));
}

export async function getMyTasks(input: {
	userId: string;
	workspaceId: string | null;
	role: MemberRole;
}): Promise<MyTaskItem[]> {
	const accessibleProjects = await getProjectsForUser(input);
	const projectIds = accessibleProjects.map((project) => project.id);
	if (projectIds.length === 0) return [];
	const rows = await db
		.select({ task: tasks, project: projects, list: lists })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.innerJoin(projects, eq(lists.projectId, projects.id))
		.where(
			and(inArray(projects.id, projectIds), eq(tasks.assigneeId, input.userId)),
		)
		.orderBy(asc(tasks.dueDate), desc(tasks.updatedAt));
	return rows.map(({ task, project, list }) => ({
		id: task.id,
		title: task.title,
		projectId: project.id,
		projectName: project.name,
		listName: list.name,
		priority: task.priority,
		dueDate: task.dueDate?.toISOString() ?? null,
		labels: task.labels,
	}));
}

export async function getAnalyticsData(input: {
	userId: string;
	workspaceId: string | null;
	role: MemberRole;
}): Promise<AnalyticsData> {
	const accessibleProjects = await getProjectsForUser(input);
	const projectIds = accessibleProjects.map((project) => project.id);
	if (projectIds.length === 0) {
		return {
			status: [],
			completedByDay: [],
			overdueTasks: 0,
			inProgressTasks: 0,
			completionRate: 0,
			averageTasksPerProject: 0,
		};
	}

	const taskRows = await db
		.select({ task: tasks, listName: lists.name })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(inArray(lists.projectId, projectIds));

	const statusMap = new Map<string, number>();
	let completed = 0;
	let inProgress = 0;
	let overdue = 0;
	const now = Date.now();
	for (const row of taskRows) {
		const label = row.listName;
		statusMap.set(label, (statusMap.get(label) ?? 0) + 1);
		if (isCompletedList(label)) completed += 1;
		if (isInProgressList(label)) inProgress += 1;
		if (
			row.task.dueDate &&
			row.task.dueDate.getTime() < now &&
			!isCompletedList(label)
		) {
			overdue += 1;
		}
	}

	const start = new Date();
	start.setHours(0, 0, 0, 0);
	start.setDate(start.getDate() - 13);
	const recent = await db
		.select({ task: tasks, listName: lists.name })
		.from(tasks)
		.innerJoin(lists, eq(tasks.listId, lists.id))
		.where(
			and(inArray(lists.projectId, projectIds), gte(tasks.updatedAt, start)),
		);

	const dayMap = new Map<string, { created: number; completed: number }>();
	for (let index = 0; index < 14; index += 1) {
		const day = new Date(start);
		day.setDate(start.getDate() + index);
		dayMap.set(day.toISOString().slice(0, 10), { created: 0, completed: 0 });
	}
	for (const row of recent) {
		const createdKey = row.task.createdAt.toISOString().slice(0, 10);

		const updatedKey = row.task.updatedAt.toISOString().slice(0, 10);

		const createdDay = dayMap.get(createdKey);

		if (createdDay) {
			createdDay.created += 1;
		}

		if (isCompletedList(row.listName)) {
			const updatedDay = dayMap.get(updatedKey);

			if (updatedDay) {
				updatedDay.completed += 1;
			}
		}
	}
	return {
		status: Array.from(statusMap, ([label, count]) => ({ label, count })),
		completedByDay: Array.from(dayMap, ([date, values]) => ({
			date,
			...values,
		})),
		overdueTasks: overdue,
		inProgressTasks: inProgress,
		completionRate: taskRows.length
			? Math.round((completed / taskRows.length) * 100)
			: 0,
		averageTasksPerProject: accessibleProjects.length
			? Math.round((taskRows.length / accessibleProjects.length) * 10) / 10
			: 0,
	};
}
