// TODO: Task 3.1 - Design database schema for users, projects, lists, and tasks
// TODO: Task 3.3 - Set up Drizzle ORM with type-safe schema definitions

/*
TODO: Implementation Notes for Interns:

1. Install Drizzle ORM dependencies:
   - drizzle-orm
   - drizzle-kit
   - @vercel/postgres (if using Vercel Postgres)
   - OR pg + @types/pg (if using regular PostgreSQL)

2. Define schemas for:
   - users (id, clerkId, email, name, createdAt, updatedAt)
   - projects (id, name, description, ownerId, createdAt, updatedAt, dueDate)
   - lists (id, name, projectId, position, createdAt, updatedAt)
   - tasks (id, title, description, listId, assigneeId, priority, dueDate, position, createdAt, updatedAt)
   - comments (id, content, taskId, authorId, createdAt, updatedAt)

3. Set up proper relationships between tables
4. Add indexes for performance
5. Configure migrations

Example structure:
import { pgTable, text, timestamp, integer, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ... other tables
*/

// Placeholder exports to prevent import errors
import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const memberRoleEnum = pgEnum("member_role", [
	"owner",
	"admin",
	"member",
	"viewer",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
	"low",
	"medium",
	"high",
]);
export const projectVisibilityEnum = pgEnum("project_visibility", [
	"private",
	"workspace",
]);
export const activityActionEnum = pgEnum("activity_action", [
	"project_created",
	"project_updated",
	"project_member_added",
	"project_member_removed",
	"list_created",
	"list_updated",
	"list_deleted",
	"task_created",
	"task_updated",
	"task_moved",
	"task_deleted",
	"comment_created",
]);

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		clerkId: text("clerk_id").notNull(),
		email: text("email").notNull(),
		name: text("name").notNull(),
		avatarUrl: text("avatar_url"),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		uniqueIndex("users_clerk_id_idx").on(table.clerkId),
		uniqueIndex("users_email_idx").on(table.email),
	],
);

export const projects = pgTable(
	"projects",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: text("name").notNull(),
		description: text("description"),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		dueDate: timestamp("due_date", { withTimezone: true }),
		visibility: projectVisibilityEnum("visibility")
			.default("private")
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("projects_owner_id_idx").on(table.ownerId),
		index("projects_updated_at_idx").on(table.updatedAt),
	],
);

export const projectMembers = pgTable(
	"project_members",
	{
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		role: memberRoleEnum("role").default("member").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.projectId, table.userId] }),
		index("project_members_user_id_idx").on(table.userId),
	],
);

export const lists = pgTable(
	"lists",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		position: integer("position").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("lists_project_id_idx").on(table.projectId),
		index("lists_project_position_idx").on(table.projectId, table.position),
	],
);

export const tasks = pgTable(
	"tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		listId: uuid("list_id")
			.notNull()
			.references(() => lists.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		description: text("description"),
		assigneeId: uuid("assignee_id").references(() => users.id, {
			onDelete: "set null",
		}),
		priority: taskPriorityEnum("priority").default("medium").notNull(),
		dueDate: timestamp("due_date", { withTimezone: true }),
		position: integer("position").notNull(),
		labels: jsonb("labels")
			.$type<string[]>()
			.default(sql`'[]'::jsonb`)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("tasks_list_id_idx").on(table.listId),
		index("tasks_assignee_id_idx").on(table.assigneeId),
		index("tasks_due_date_idx").on(table.dueDate),
		index("tasks_list_position_idx").on(table.listId, table.position),
	],
);

export const comments = pgTable(
	"comments",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		taskId: uuid("task_id")
			.notNull()
			.references(() => tasks.id, { onDelete: "cascade" }),
		authorId: uuid("author_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("comments_task_id_idx").on(table.taskId),
		index("comments_author_id_idx").on(table.authorId),
	],
);

export const activities = pgTable(
	"activities",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		projectId: uuid("project_id")
			.notNull()
			.references(() => projects.id, { onDelete: "cascade" }),
		actorId: uuid("actor_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		taskId: uuid("task_id").references(() => tasks.id, {
			onDelete: "set null",
		}),
		action: activityActionEnum("action").notNull(),
		metadata: jsonb("metadata")
			.$type<Record<string, string | number | boolean | null>>()
			.default(sql`'{}'::jsonb`)
			.notNull(),
		createdAt: timestamp("created_at", { withTimezone: true })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		index("activities_project_id_idx").on(table.projectId),
		index("activities_created_at_idx").on(table.createdAt),
	],
);

export const usersRelations = relations(users, ({ many }) => ({
	ownedProjects: many(projects),
	memberships: many(projectMembers),
	assignedTasks: many(tasks),
	comments: many(comments),
	activities: many(activities),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
	owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
	members: many(projectMembers),
	lists: many(lists),
	activities: many(activities),
}));

export const projectMembersRelations = relations(projectMembers, ({ one }) => ({
	project: one(projects, {
		fields: [projectMembers.projectId],
		references: [projects.id],
	}),
	user: one(users, { fields: [projectMembers.userId], references: [users.id] }),
}));

export const listsRelations = relations(lists, ({ one, many }) => ({
	project: one(projects, {
		fields: [lists.projectId],
		references: [projects.id],
	}),
	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	list: one(lists, { fields: [tasks.listId], references: [lists.id] }),
	assignee: one(users, { fields: [tasks.assigneeId], references: [users.id] }),
	comments: many(comments),
	activities: many(activities),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
	task: one(tasks, { fields: [comments.taskId], references: [tasks.id] }),
	author: one(users, { fields: [comments.authorId], references: [users.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
	project: one(projects, {
		fields: [activities.projectId],
		references: [projects.id],
	}),
	actor: one(users, { fields: [activities.actorId], references: [users.id] }),
	task: one(tasks, { fields: [activities.taskId], references: [tasks.id] }),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type ProjectRow = typeof projects.$inferSelect;
export type ListRow = typeof lists.$inferSelect;
export type TaskRow = typeof tasks.$inferSelect;
export type CommentRow = typeof comments.$inferSelect;
export type ActivityRow = typeof activities.$inferSelect;
