export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type TaskPriority = "low" | "medium" | "high";
export type ProjectVisibility = "private" | "workspace";

export interface UserSummary {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
}

export interface ProjectSummary {
	id: string;
	name: string;
	description: string | null;
	dueDate: string | null;
	visibility: ProjectVisibility;
	role: MemberRole;
	memberCount: number;
	taskCount: number;
	completedTaskCount: number;
	updatedAt: string;
}

export interface BoardList {
	id: string;
	projectId: string;
	name: string;
	position: number;
}

export interface BoardTask {
	id: string;
	listId: string;
	title: string;
	description: string | null;
	assigneeId: string | null;
	assignee: UserSummary | null;
	priority: TaskPriority;
	dueDate: string | null;
	position: number;
	labels: string[];
	commentsCount: number;
	createdAt: string;
	updatedAt: string;
}

export interface ProjectMember {
	projectId: string;
	role: MemberRole;
	user: UserSummary;
}

export interface TaskComment {
	id: string;
	taskId: string;
	content: string;
	createdAt: string;
	updatedAt: string;
	author: UserSummary;
}

export interface ActivityItem {
	id: string;
	action:
		| "project_created"
		| "project_updated"
		| "project_member_added"
		| "project_member_removed"
		| "list_created"
		| "list_updated"
		| "list_deleted"
		| "task_created"
		| "task_updated"
		| "task_moved"
		| "task_deleted"
		| "comment_created";
	metadata: Record<string, string | number | boolean | null>;
	createdAt: string;
	actor: UserSummary;
}

export interface ProjectBoardData {
	project: {
		id: string;
		name: string;
		description: string | null;
		dueDate: string | null;
		visibility: ProjectVisibility;
		role: MemberRole;
	};
	lists: BoardList[];
	tasks: BoardTask[];
	members: ProjectMember[];
	activities: ActivityItem[];
}

export interface ActionResult<T = undefined> {
	success: boolean;
	message: string;
	data?: T;
	fieldErrors?: Record<string, string[]>;
}
