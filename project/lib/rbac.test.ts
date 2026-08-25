import { describe, expect, it } from "vitest";
import { hasPermission, requirePermission } from "./rbac";

describe("role permissions", () => {
	it("keeps destructive project actions restricted", () => {
		expect(hasPermission("owner", "project:delete")).toBe(true);
		expect(hasPermission("admin", "project:delete")).toBe(true);
		expect(hasPermission("member", "project:delete")).toBe(false);
		expect(hasPermission("viewer", "project:update")).toBe(false);
	});

	it("throws a stable error when permission is denied", () => {
		expect(() => requirePermission("viewer", "team:manage")).toThrow(
			"You do not have permission to perform this action.",
		);
	});
});
