import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getWorkspaceContext } from "@/lib/auth";
import {
	getWorkspaceMemberPreview,
	getWorkspaceSummary,
} from "@/lib/workspaces";

export default async function ProtectedLayout({
	children,
}: {
	children: ReactNode;
}) {
	const context = await getWorkspaceContext();
	const [workspace, members] = context.workspaceId
		? await Promise.all([
				getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
				getWorkspaceMemberPreview(context.workspaceId, 4),
			])
		: [null, []];

	return (
		<DashboardLayout
			user={{
				id: context.user.id,
				name: context.user.name,
				email: context.user.email,
				avatarUrl: context.user.avatarUrl,
			}}
			workspace={workspace}
			workspaceMembers={members.slice(0, 4)}
		>
			{children}
		</DashboardLayout>
	);
}
