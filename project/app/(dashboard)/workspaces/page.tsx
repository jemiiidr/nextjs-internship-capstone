import type { Metadata } from "next";
import { WorkspaceManagement } from "@/components/workspaces/workspace-management";
import { getWorkspaceContext } from "@/lib/auth";
import { getWorkspaceProjectCounts } from "@/lib/db";
import { getUserWorkspaces, getWorkspaceMembers } from "@/lib/workspaces";

export const metadata: Metadata = { title: "Workspaces" };

export default async function WorkspacesPage({
	searchParams,
}: {
	searchParams: Promise<{ create?: string }>;
}) {
	const context = await getWorkspaceContext();
	const [workspaces, params] = await Promise.all([
		getUserWorkspaces(context.clerkUserId),
		searchParams,
	]);
	const [members, projectCounts] = await Promise.all([
		Promise.all(
			workspaces.map(
				async (workspace) =>
					[workspace.id, await getWorkspaceMembers(workspace.id)] as const,
			),
		),
		getWorkspaceProjectCounts(workspaces.map((workspace) => workspace.id)),
	]);
	const membersByWorkspace = Object.fromEntries(members);

	return (
		<WorkspaceManagement
			workspaces={workspaces}
			membersByWorkspace={membersByWorkspace}
			projectCounts={projectCounts}
			activeWorkspaceId={context.workspaceId}
			initialCreateOpen={params.create === "1"}
		/>
	);
}
