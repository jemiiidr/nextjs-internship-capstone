import { Building2, Plus, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LegacyProjectMoveButton } from "@/components/legacy-project-move-button";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspaceActivateButton } from "@/components/workspace-activate-button";
import { getWorkspaceContext } from "@/lib/auth";
import { getLegacyProjectsForOwner } from "@/lib/db";
import { getUserWorkspaces, getWorkspaceMemberPreview } from "@/lib/workspaces";

export const metadata: Metadata = { title: "Workspaces" };

export default async function WorkspacesPage() {
	const context = await getWorkspaceContext();
	const [workspaces, legacyProjects] = await Promise.all([
		getUserWorkspaces(context.clerkUserId),
		getLegacyProjectsForOwner(context.user.id),
	]);
	const previews = new Map(
		await Promise.all(
			workspaces.map(
				async (workspace) =>
					[
						workspace.id,
						await getWorkspaceMemberPreview(workspace.id, 4),
					] as const,
			),
		),
	);

	return (
		<div className="space-y-7">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						Your organizations
					</p>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Workspaces
					</h1>
					<p className="mt-2 max-w-2xl text-paynes_gray-500 dark:text-french_gray-400">
						Each Flowora workspace maps to a Clerk Organization, so membership
						and role changes stay centralized in Clerk.
					</p>
				</div>
				<Link href="/workspaces/new">
					<Button>
						<Plus size={16} /> New workspace
					</Button>
				</Link>
			</header>

			{workspaces.length === 0 ? (
				<div className="flowora-panel rounded-3xl border border-dashed border-blue_munsell-200 bg-white p-10 text-center dark:border-blue_munsell-800 dark:bg-outer_space-500">
					<span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
						<Building2 />
					</span>
					<h2 className="mt-4 text-xl font-semibold text-outer_space-900 dark:text-platinum-50">
						Create your first workspace
					</h2>
					<p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-paynes_gray-500">
						Projects are isolated by workspace. Create one to start a board and
						invite collaborators.
					</p>
					<Link href="/workspaces/new" className="mt-5 inline-block">
						<Button>
							Create workspace <Plus size={15} />
						</Button>
					</Link>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{workspaces.map((workspace, index) => {
						const active = workspace.id === context.workspaceId;
						const accents = [
							"from-[#7467f0]/18 to-[#72bada]/12",
							"from-[#e989b8]/18 to-[#f5ad78]/12",
							"from-[#76caa5]/18 to-[#e9be65]/12",
						];
						return (
							<Card key={workspace.id} className="overflow-hidden">
								<div
									className={`h-2 bg-gradient-to-r ${accents[index % accents.length]}`}
								/>
								<CardContent className="p-5">
									<div className="flex items-start justify-between gap-3">
										<span className="grid size-11 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
											<Building2 size={20} />
										</span>
										{active ? (
											<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
												Active
											</span>
										) : null}
									</div>
									<h2 className="mt-4 truncate text-lg font-semibold text-outer_space-900 dark:text-platinum-50">
										{workspace.name}
									</h2>
									<p className="mt-1 text-xs text-paynes_gray-400">
										{workspace.slug ? `@${workspace.slug}` : workspace.id}
									</p>
									<div className="mt-5 grid grid-cols-2 gap-2 text-sm text-paynes_gray-500">
										<span className="flex items-center gap-2">
											<Users size={15} /> {workspace.memberCount} members
										</span>
										<span className="flex items-center gap-2 capitalize">
											<ShieldCheck size={15} /> {workspace.role}
										</span>
									</div>
									<div className="mt-5 flex items-center justify-between">
										<AvatarStack
											users={previews.get(workspace.id) ?? []}
											total={workspace.memberCount}
										/>
										<WorkspaceActivateButton
											workspaceId={workspace.id}
											active={active}
										/>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			{legacyProjects.length > 0 ? (
				<section className="flowora-panel rounded-3xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-800 dark:bg-outer_space-500">
					<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.14em] text-paynes_gray-400">
								Upgrade path
							</p>
							<h2 className="mt-1 text-lg font-semibold text-outer_space-900 dark:text-platinum-50">
								Legacy projects
							</h2>
							<p className="mt-1 max-w-2xl text-sm text-paynes_gray-500">
								These projects were created before Flowora workspaces. They stay
								private to you until you explicitly move them into the active
								workspace.
							</p>
						</div>
						{context.workspaceId ? (
							<span className="text-xs font-medium text-blue_munsell-600">
								Moving into the active workspace
							</span>
						) : (
							<span className="text-xs text-paynes_gray-500">
								Choose a workspace first
							</span>
						)}
					</div>
					<div className="mt-4 divide-y divide-french_gray-200 dark:divide-paynes_gray-800">
						{legacyProjects.map((project) => (
							<div
								key={project.id}
								className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
										{project.name}
									</p>
									<p className="mt-1 line-clamp-1 text-xs text-paynes_gray-500">
										{project.description || "No description"}
									</p>
								</div>
								{context.workspaceId && context.role !== "viewer" ? (
									<LegacyProjectMoveButton projectId={project.id} />
								) : null}
							</div>
						))}
					</div>
				</section>
			) : null}
		</div>
	);
}
