import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, findUserByClerkId } from "@/lib/db";
import { projects, users } from "@/lib/db/schema";
import { hasPermission } from "@/lib/rbac";
import { upsertClerkUser } from "@/lib/users";
import { normalizeWorkspaceRole } from "@/lib/workspaces";
import type { MemberRole } from "@/types";

export async function syncCurrentUser() {
	const { userId } = await auth();
	if (!userId) return null;

	const clerkUser = await currentUser();
	if (!clerkUser) return null;

	const email =
		clerkUser.primaryEmailAddress?.emailAddress ??
		clerkUser.emailAddresses[0]?.emailAddress ??
		`${userId}@users.local`;
	const name =
		[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
		clerkUser.username ||
		email.split("@")[0] ||
		"Kanvas user";

	return upsertClerkUser({
		clerkId: userId,
		email,
		name,
		avatarUrl: clerkUser.imageUrl,
	});
}

export async function requireDbUser() {
	const { userId } = await auth();
	if (!userId) redirect("/sign-in");

	const existing = await findUserByClerkId(userId);
	if (existing) return existing;

	const synced = await syncCurrentUser();
	if (!synced) redirect("/sign-in");
	return synced;
}

export async function getWorkspaceContext() {
	const authState = await auth();
	if (!authState.userId) redirect("/sign-in");
	const user = await requireDbUser();
	return {
		user,
		clerkUserId: authState.userId,
		workspaceId: authState.orgId ?? null,
		workspaceRoleKey: authState.orgRole ?? null,
		role: normalizeWorkspaceRole(authState.orgRole),
	};
}

export async function requireWorkspaceContext() {
	const context = await getWorkspaceContext();
	if (!context.workspaceId) redirect("/workspaces");
	return { ...context, workspaceId: context.workspaceId };
}

export async function requireProjectAccess(projectId: string) {
	const context = await getWorkspaceContext();
	const project = await db.query.projects.findFirst({
		where: eq(projects.id, projectId),
	});
	if (!project) return null;

	// New Kanvas projects are scoped to the active Clerk Organization.
	if (project.workspaceId) {
		if (!context.workspaceId || project.workspaceId !== context.workspaceId) {
			return null;
		}
		return {
			project,
			role: context.role,
			isOwner: project.ownerId === context.user.id,
			user: context.user,
			workspaceId: context.workspaceId,
			clerkUserId: context.clerkUserId,
		};
	}

	return null;
}

export function canManageProject(role: MemberRole) {
	return hasPermission(role, "project:delete");
}

export function canEditProject(role: MemberRole) {
	return hasPermission(role, "project:update");
}

export function requireProjectRole(role: MemberRole, allowed: MemberRole[]) {
	if (!allowed.includes(role)) {
		throw new Error("You do not have permission to perform this action.");
	}
}

export async function deleteSyncedUser(clerkId: string) {
	await db.delete(users).where(eq(users.clerkId, clerkId));
}
