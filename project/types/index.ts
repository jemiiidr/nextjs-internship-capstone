export type MemberRole = "owner" | "admin" | "member" | "viewer";
export type TaskPriority = "low" | "medium" | "high";
export type ProjectVisibility = "private" | "workspace";
export type NotificationType =
	| "task_assigned"
	| "task_reassigned"
	| "deadline_today"
	| "task_overdue"
	| "member_joined";

export interface UserSummary {
	id: string;
	name: string;
	email: string;
	avatarUrl: string | null;
}

export interface WorkspaceMember extends UserSummary {
	clerkId: string;
	role: Exclude<MemberRole, "owner">;
	roleKey: string;
}

export interface WorkspaceSummary {
	id: string;
	name: string;
	slug: string | null;
	imageUrl: string | null;
	role: Exclude<MemberRole, "owner">;
	roleKey: string;
	memberCount: number;
}

export interface WorkspaceInvitation {
	id: string;
	email: string;
	role: Exclude<MemberRole, "owner" | "viewer">;
	createdAt: string;
	expiresAt: string;
}

export interface NotificationItem {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	href: string;
	read: boolean;
	createdAt: string;
}

export interface ProjectSummary {
	id: string;
	workspaceId: string | null;
	name: string;
	description: string | null;
	iconDataUrl: string | null;
	dueDate: string | null;
	visibility: ProjectVisibility;
	role: MemberRole;
	isOwner: boolean;
	memberCount: number;
	members: UserSummary[];
	taskCount: number;
	completedTaskCount: number;
	createdAt: string;
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
	roleLabel: string | null;
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
		workspaceId: string | null;
		name: string;
		description: string | null;
		iconDataUrl: string | null;
		dueDate: string | null;
		visibility: ProjectVisibility;
		role: MemberRole;
		isOwner: boolean;
	};
	lists: BoardList[];
	tasks: BoardTask[];
	members: ProjectMember[];
	activities: ActivityItem[];
}

export interface MyTaskItem {
	id: string;
	title: string;
	projectId: string;
	projectName: string;
	listName: string;
	priority: TaskPriority;
	dueDate: string | null;
	labels: string[];
}

export interface AnalyticsData {
	status: Array<{ label: string; count: number }>;
	completedByDay: Array<{ date: string; completed: number; created: number }>;
	overdueTasks: number;
	inProgressTasks: number;
	completionRate: number;
	averageTasksPerProject: number;
}

export interface ActionResult<T = undefined> {
	success: boolean;
	message: string;
	data?: T;
	fieldErrors?: Record<string, string[]>;
}
