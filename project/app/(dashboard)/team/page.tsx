import type { Metadata } from "next";
import { notifyWorkspaceJoinedAction } from "@/app/actions/team";
import { TeamManagement } from "@/components/team/team-management";
import { requireWorkspaceContext } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import {
	getPendingWorkspaceInvitations,
	getWorkspaceMembers,
	getWorkspaceSummary,
} from "@/lib/workspaces";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
	const context = await requireWorkspaceContext();
	// Invitation acceptance for a brand-new Clerk account redirects directly to
	// this page, bypassing the client-side acceptance handler. Reconcile the
	// idempotent join notification here so existing members are always notified.
	await notifyWorkspaceJoinedAction(context.workspaceId, false);
	const canManageMembers = hasPermission(context.role, "team:manage");
	const [workspace, members, invitations] = await Promise.all([
		getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
		getWorkspaceMembers(context.workspaceId),
		canManageMembers
			? getPendingWorkspaceInvitations(context.workspaceId)
			: Promise.resolve([]),
	]);
	return (
		<TeamManagement
			workspaceName={workspace.name}
			members={members}
			invitations={invitations}
			currentUserId={context.user.id}
			currentUserRole={context.role}
			canManageMembers={canManageMembers}
		/>
	);
}
