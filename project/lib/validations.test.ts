import { describe, expect, it } from "vitest";
import {
	bulkMoveTasksSchema,
	commentSchema,
	projectSchema,
	taskSchema,
	workspaceInvitationSchema,
} from "./validations";

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
});
