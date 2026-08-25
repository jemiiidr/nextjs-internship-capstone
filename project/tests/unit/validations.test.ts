import {
	bulkMoveTasksSchema,
	commentSchema,
	projectSchema,
	taskSchema,
	workspaceInvitationSchema,
} from "@/lib/validations";

const projectId = "11111111-1111-4111-8111-111111111111";
const listId = "22222222-2222-4222-8222-222222222222";

describe("form validation boundaries", () => {
	it("accepts leap days and rejects impossible dates", () => {
		expect(
			projectSchema.safeParse({ name: "Launch", dueDate: "2024-02-29" })
				.success,
		).toBe(true);
		expect(
			projectSchema.safeParse({ name: "Launch", dueDate: "2025-02-29" })
				.success,
		).toBe(false);
		expect(
			projectSchema.safeParse({ name: "Launch", dueDate: "2025-04-31" })
				.success,
		).toBe(false);
	});

	it("normalizes optional whitespace fields", () => {
		const result = taskSchema.safeParse({
			projectId,
			listId,
			title: "  Prepare demo  ",
			description: "   ",
			dueDate: "",
			assigneeId: "",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe("Prepare demo");
			expect(result.data.description).toBeUndefined();
			expect(result.data.dueDate).toBeUndefined();
		}
	});

	it("rejects empty comments after trimming", () => {
		expect(
			commentSchema.safeParse({ projectId, taskId: listId, content: "   " })
				.success,
		).toBe(false);
	});

	it("normalizes invitation emails and rejects unsupported roles", () => {
		const result = workspaceInvitationSchema.safeParse({
			email: " USER@Example.COM ",
			role: "org:member",
		});
		expect(result.success && result.data.email).toBe("user@example.com");
		expect(
			workspaceInvitationSchema.safeParse({
				email: "a@example.com",
				role: "owner",
			}).success,
		).toBe(false);
	});

	it("limits bulk operations and rejects duplicate-free empty input", () => {
		expect(
			bulkMoveTasksSchema.safeParse({
				projectId,
				taskIds: [],
				toListId: listId,
			}).success,
		).toBe(false);
		expect(
			bulkMoveTasksSchema.safeParse({
				projectId,
				taskIds: Array.from({ length: 101 }, () => listId),
				toListId: listId,
			}).success,
		).toBe(false);
	});

	it("accepts valid deadline times and rejects invalid clock values", () => {
		const baseTask = { projectId, listId, title: "Prepare release" };
		expect(
			taskSchema.safeParse({ ...baseTask, dueTime: "23:59" }).success,
		).toBe(true);
		expect(
			taskSchema.safeParse({ ...baseTask, dueTime: "24:00" }).success,
		).toBe(false);
		expect(
			taskSchema.safeParse({ ...baseTask, dueTime: "9:30 PM" }).success,
		).toBe(false);
	});

	it("enforces project and task text limits", () => {
		expect(projectSchema.safeParse({ name: "A" }).success).toBe(false);
		expect(projectSchema.safeParse({ name: "A".repeat(101) }).success).toBe(
			false,
		);
		expect(
			taskSchema.safeParse({ projectId, listId, title: "T".repeat(201) })
				.success,
		).toBe(false);
	});

	it("rejects malformed project and assignee identifiers", () => {
		expect(
			taskSchema.safeParse({ projectId: "project", listId, title: "Task" })
				.success,
		).toBe(false);
		expect(
			taskSchema.safeParse({
				projectId,
				listId,
				title: "Task",
				assigneeId: "user",
			}).success,
		).toBe(false);
	});

	it("accepts the maximum bulk task count", () => {
		const taskIds = Array.from(
			{ length: 100 },
			(_, index) =>
				`${String(index).padStart(8, "0")}-1111-4111-8111-111111111111`,
		);
		expect(
			bulkMoveTasksSchema.safeParse({ projectId, taskIds, toListId: listId })
				.success,
		).toBe(true);
	});
});
