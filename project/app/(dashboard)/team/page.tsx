import type { Metadata } from "next";
import { InviteMemberButton, TeamTabs } from "@/components/team/team-management";
import { requireWorkspaceContext } from "@/lib/auth";
import {
	getPendingWorkspaceInvitations,
	getWorkspaceMembers,
	getWorkspaceSummary,
} from "@/lib/workspaces";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
	const context = await requireWorkspaceContext();
	const canManageMembers = context.role === "admin";
	const [workspace, members, invitations] = await Promise.all([
		getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
		getWorkspaceMembers(context.workspaceId),
		canManageMembers
			? getPendingWorkspaceInvitations(context.workspaceId)
			: Promise.resolve([]),
	]);
	return (
		<div className="space-y-7">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						{workspace.name}
					</p>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Team
					</h1>
					<p className="mt-2 max-w-2xl text-paynes_gray-500">
						Workspace membership and access roles come directly from your Clerk
						Organization.
					</p>
				</div>
				{canManageMembers ? <InviteMemberButton /> : null}
			</header>
			<TeamTabs members={members} invitations={invitations} />
		</div>
	);
}
