// TODO: Task 3.2 - Configure PostgreSQL database (Vercel Postgres or Neon)
// TODO: Task 3.5 - Implement database connection and query utilities

/*
TODO: Implementation Notes for Interns:

1. Choose database provider:
   - Vercel Postgres (recommended for Vercel deployment)
   - Neon (good alternative)
   - Local PostgreSQL for development

2. Set up environment variables:
   - DATABASE_URL
   - POSTGRES_URL (if using Vercel Postgres)

3. Configure Drizzle connection
4. Implement CRUD operations for all entities
5. Add proper error handling
6. Set up connection pooling if needed

Example structure:
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

export const db = drizzle(sql, { schema })

export const queries = {
  projects: {
    getAll: async () => { ... },
    getById: async (id: string) => { ... },
    create: async (data: any) => { ... },
    update: async (id: string, data: any) => { ... },
    delete: async (id: string) => { ... },
  },
  // ... other entity queries
}
*/
import "server-only";

import { and, asc, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import type {
	ActivityItem,
	BoardList,
	BoardTask,
	MemberRole,
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

export async function findUserByClerkId(clerkId: string) {
	return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
}

export async function getProjectAccess(projectId: string, userId: string) {
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId),
	});
	if (!project) return null;

	if (project.ownerId === userId) {
		return { project, role: "owner" as const };
	}

	const membership = await db.query.projectMembers.findFirst({
		where: and(
			eq(projectMembers.projectId, projectId),
			eq(projectMembers.userId, userId),
		),
	});

	if (membership) return { project, role: membership.role };
	if (project.visibility === "workspace")
		return { project, role: "viewer" as const };
	return null;
}

export function canManageProject(role: MemberRole) {
	return role === "owner" || role === "admin";
}

export function canEditProject(role: MemberRole) {
	return role !== "viewer";
}

export async function getProjectsForUser(
	userId: string,
	search = "",
): Promise<ProjectSummary[]> {
	const normalizedSearch = search.trim();
	const accessCondition = or(
		eq(projects.ownerId, userId),
		eq(projectMembers.userId, userId),
		eq(projects.visibility, "workspace"),
	);
	const whereCondition = normalizedSearch
		? and(accessCondition, ilike(projects.name, `%${normalizedSearch}%`))
		: accessCondition;

	const projectRows = await db
		.select({ project: projects, membershipRole: projectMembers.role })
		.from(projects)
		.leftJoin(
			projectMembers,
			and(
				eq(projectMembers.projectId, projects.id),
				eq(projectMembers.userId, userId),
			),
		)
		.where(whereCondition)
		.orderBy(desc(projects.updatedAt));

	const uniqueProjects = new Map<
		string,
		{ project: typeof projects.$inferSelect; role: MemberRole }
	>();
	for (const row of projectRows) {
		uniqueProjects.set(row.project.id, {
			project: row.project,
			role:
				row.project.ownerId === userId
					? "owner"
					: (row.membershipRole ?? "viewer"),
		});
	}

	const projectIds = Array.from(uniqueProjects.keys());
	if (projectIds.length === 0) return [];

	const [memberRows, taskRows] = await Promise.all([
		db
			.select({
				projectId: projectMembers.projectId,
				userId: projectMembers.userId,
			})
			.from(projectMembers)
			.where(inArray(projectMembers.projectId, projectIds)),
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

	const memberCounts = new Map<string, Set<string>>();
	for (const row of memberRows) {
		const set = memberCounts.get(row.projectId) ?? new Set<string>();
		set.add(row.userId);
		memberCounts.set(row.projectId, set);
	}

	const taskCounts = new Map<string, { total: number; completed: number }>();
	for (const row of taskRows) {
		if (!row.taskId) continue;
		const current = taskCounts.get(row.projectId) ?? { total: 0, completed: 0 };
		current.total += 1;
		if (
			["done", "complete", "completed"].includes(
				row.listName.trim().toLowerCase(),
			)
		) {
			current.completed += 1;
		}
		taskCounts.set(row.projectId, current);
	}

	return Array.from(uniqueProjects.values()).map(({ project, role }) => {
		const counts = taskCounts.get(project.id) ?? { total: 0, completed: 0 };
		return {
			id: project.id,
			name: project.name,
			description: project.description,
			dueDate: project.dueDate?.toISOString() ?? null,
			visibility: project.visibility,
			role,
			memberCount: memberCounts.get(project.id)?.size ?? 1,
			taskCount: counts.total,
			completedTaskCount: counts.completed,
			updatedAt: project.updatedAt.toISOString(),
		};
	});
}

export async function getDashboardData(userId: string) {
	const projectSummaries = await getProjectsForUser(userId);
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
	userId: string,
): Promise<ProjectBoardData | null> {
	const access = await getProjectAccess(projectId, userId);
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
		role: membership.role,
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
			name: access.project.name,
			description: access.project.description,
			dueDate: access.project.dueDate?.toISOString() ?? null,
			visibility: access.project.visibility,
			role: access.role,
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
	userId: string,
): Promise<TaskComment[]> {
	const access = await getProjectAccess(projectId, userId);
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

export async function getWorkspaceUsers(): Promise<UserSummary[]> {
	const rows = await db.select().from(users).orderBy(asc(users.name));
	return rows.map(serializeUser);
}

export async function getCalendarTasks(userId: string) {
	const accessibleProjects = await getProjectsForUser(userId);
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
				or(eq(tasks.assigneeId, userId), eq(projects.ownerId, userId)),
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
