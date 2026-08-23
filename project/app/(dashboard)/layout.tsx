import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { getWorkspaceContext } from "@/lib/auth";
import { getUserNotifications } from "@/lib/notifications";
import { getWorkspaceSummary } from "@/lib/workspaces";

export default async function ProtectedLayout({
	children,
}: {
	children: ReactNode;
}) {
	const context = await getWorkspaceContext();
	const [workspace, notifications] = context.workspaceId
		? await Promise.all([
				getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
				getUserNotifications({
					userId: context.user.id,
					workspaceId: context.workspaceId,
				}),
			])
		: [
				null,
				await getUserNotifications({
					userId: context.user.id,
					workspaceId: null,
				}),
			];

	return (
		<DashboardLayout
			user={{
				id: context.user.id,
				name: context.user.name,
				email: context.user.email,
				avatarUrl: context.user.avatarUrl,
			}}
			workspace={workspace}
			notifications={notifications}
		>
			{children}
		</DashboardLayout>
	);
}
