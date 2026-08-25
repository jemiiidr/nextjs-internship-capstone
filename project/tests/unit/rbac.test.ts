import { hasPermission, requirePermission } from "@/lib/rbac";

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

	it("allows owners and admins to manage a workspace and team", () => {
		for (const role of ["owner", "admin"] as const) {
			expect(hasPermission(role, "workspace:update")).toBe(true);
			expect(hasPermission(role, "team:manage")).toBe(true);
			expect(hasPermission(role, "project:manage-members")).toBe(true);
		}
	});

	it("allows members to collaborate without destructive access", () => {
		expect(hasPermission("member", "project:create")).toBe(true);
		expect(hasPermission("member", "project:update")).toBe(true);
		expect(hasPermission("member", "project:delete")).toBe(false);
		expect(hasPermission("member", "team:manage")).toBe(false);
	});

	it("keeps viewers read-only", () => {
		expect(hasPermission("viewer", "workspace:view")).toBe(true);
		expect(hasPermission("viewer", "project:view")).toBe(true);
		expect(hasPermission("viewer", "project:create")).toBe(false);
		expect(hasPermission("viewer", "project:update")).toBe(false);
	});

	it("does not throw when a permission is granted", () => {
		expect(() => requirePermission("owner", "team:manage")).not.toThrow();
	});
});
