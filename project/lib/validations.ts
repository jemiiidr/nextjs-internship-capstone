import { z } from "zod";

const optionalText = (maximum: number) =>
	z.preprocess(
		(value) =>
			typeof value === "string" && value.trim() === "" ? undefined : value,
		z.string().trim().max(maximum).optional(),
	);

const optionalUuid = z.preprocess(
	(value) =>
		typeof value === "string" && value.trim() === "" ? undefined : value,
	z.string().uuid().optional(),
);

const optionalDateInput = z.preprocess(
	(value) =>
		typeof value === "string" && value.trim() === "" ? undefined : value,
	z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date")
		.optional(),
);

export const projectSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Project name must be at least 2 characters")
		.max(100),
	description: optionalText(800),
	dueDate: optionalDateInput,
	visibility: z.enum(["private", "workspace"]).default("private"),
});

export const projectUpdateSchema = projectSchema.extend({
	projectId: z.string().uuid(),
});

export const listSchema = z.object({
	projectId: z.string().uuid(),
	name: z.string().trim().min(1, "List name is required").max(60),
});

export const listUpdateSchema = listSchema.extend({
	listId: z.string().uuid(),
});

export const taskSchema = z.object({
	projectId: z.string().uuid(),
	listId: z.string().uuid(),
	title: z.string().trim().min(1, "Task title is required").max(200),
	description: optionalText(2_000),
	priority: z.enum(["low", "medium", "high"]).default("medium"),
	dueDate: optionalDateInput,
	assigneeId: optionalUuid,
	labels: optionalText(300),
});

export const taskUpdateSchema = taskSchema.extend({
	taskId: z.string().uuid(),
});

export const moveTaskSchema = z.object({
	projectId: z.string().uuid(),
	taskId: z.string().uuid(),
	fromListId: z.string().uuid(),
	toListId: z.string().uuid(),
	position: z.number().int().min(0),
});

export const commentSchema = z.object({
	projectId: z.string().uuid(),
	taskId: z.string().uuid(),
	content: z.string().trim().min(1, "Comment cannot be empty").max(1_000),
});

export const memberSchema = z.object({
	projectId: z.string().uuid(),
	userId: z.string().uuid(),
});

export const userSchema = z.object({
	name: z.string().trim().min(2).max(100),
	email: z.string().email(),
});

export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
