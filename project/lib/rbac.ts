import type { MemberRole } from "@/types";

export type AppPermission =
	| "workspace:view"
	| "workspace:create"
	| "workspace:update"
	| "team:view"
	| "team:manage"
	| "project:view"
	| "project:create"
	| "project:update"
	| "project:delete"
	| "project:manage-members"
	| "analytics:view"
	| "notifications:view"
	| "account:update";

const rolePermissions: Record<MemberRole, ReadonlySet<AppPermission>> = {
	owner: new Set<AppPermission>([
		"workspace:view",
		"workspace:create",
		"workspace:update",
		"team:view",
		"team:manage",
		"project:view",
		"project:create",
		"project:update",
		"project:delete",
		"project:manage-members",
		"analytics:view",
		"notifications:view",
		"account:update",
	]),
	admin: new Set<AppPermission>([
		"workspace:view",
		"workspace:create",
		"workspace:update",
		"team:view",
		"team:manage",
		"project:view",
		"project:create",
		"project:update",
		"project:delete",
		"project:manage-members",
		"analytics:view",
		"notifications:view",
		"account:update",
	]),
	member: new Set<AppPermission>([
		"workspace:view",
		"workspace:create",
		"team:view",
		"project:view",
		"project:create",
		"project:update",
		"analytics:view",
		"notifications:view",
		"account:update",
	]),
	viewer: new Set<AppPermission>([
		"workspace:view",
		"team:view",
		"project:view",
		"analytics:view",
		"notifications:view",
		"account:update",
	]),
};

export function hasPermission(role: MemberRole, permission: AppPermission) {
	return rolePermissions[role].has(permission);
}

export function requirePermission(role: MemberRole, permission: AppPermission) {
	if (!hasPermission(role, permission))
		throw new Error("You do not have permission to perform this action.");
}
