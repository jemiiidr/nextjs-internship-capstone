import type { Metadata } from "next";
import { WorkspaceManagement } from "@/components/workspaces/workspace-management";
import { getWorkspaceContext } from "@/lib/auth";
import { getUserWorkspaces, getWorkspaceMemberPreview } from "@/lib/workspaces";

export const metadata: Metadata = { title: "Workspaces" };

export default async function WorkspacesPage({ searchParams }: { searchParams: Promise<{ create?: string }> }) {
	const context = await getWorkspaceContext();
	const [workspaces, params] = await Promise.all([getUserWorkspaces(context.clerkUserId), searchParams]);
	const previews = Object.fromEntries(await Promise.all(workspaces.map(async (workspace) => [workspace.id, await getWorkspaceMemberPreview(workspace.id, 4)] as const)));

	return <div className="space-y-7"><header><p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">Your organizations</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">Workspaces</h1><p className="mt-2 max-w-2xl text-paynes_gray-500 dark:text-french_gray-400">Manage the teams, membership boundaries, and project spaces available to your account.</p></header><WorkspaceManagement workspaces={workspaces} previews={previews} activeWorkspaceId={context.workspaceId} initialCreateOpen={params.create === "1"} /></div>;
}
