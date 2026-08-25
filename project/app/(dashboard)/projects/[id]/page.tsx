import { ArrowLeft, Building2, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityFeed } from "@/components/project-detail/activity-feed";
import { KanbanBoard } from "@/components/project-detail/kanban-board";
import { ProjectActions } from "@/components/project-detail/project-actions";
import { ProjectMembers } from "@/components/project-detail/project-members";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { getWorkspaceContext } from "@/lib/auth";
import { canManageProject, getProjectBoard } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { getWorkspaceMembers, getWorkspaceSummary } from "@/lib/workspaces";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	return { title: `Project ${id.slice(0, 8)}` };
}

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const context = await getWorkspaceContext();
	const board = await getProjectBoard(id, {
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
	});
	if (!board) notFound();
	const [workspaceUsers, workspace] = board.project.workspaceId
		? await Promise.all([
				getWorkspaceMembers(board.project.workspaceId),
				getWorkspaceSummary(
					board.project.workspaceId,
					context.workspaceRoleKey,
				),
			])
		: [[], null];
	const memberUsers = board.members.map((member) => member.user);
	const canManage = canManageProject(board.project.role);

	return (
		<div className="min-w-0">
			<Link
				href="/projects"
				className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-paynes_gray-500 transition hover:text-blue_munsell-600"
			>
				<ArrowLeft size={15} /> Projects
			</Link>
			<div className="grid min-w-0 items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_19rem]">
				<div className="min-w-0">
					<header className="min-h-52 rounded-2xl border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-800 dark:bg-outer_space-500">
						<div className="flex min-h-40 items-stretch gap-5">
							<div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-blue_munsell-500 to-blue_munsell-400 text-3xl font-bold text-white">
								{board.project.iconDataUrl ? (
									<Image
										src={board.project.iconDataUrl}
										alt={`${board.project.name} icon`}
										fill
										sizes="80px"
										unoptimized
										className="object-cover"
									/>
								) : (
									board.project.name.slice(0, 1).toUpperCase()
								)}
							</div>
							<div className="flex min-w-0 flex-1 flex-col">
								<div className="flex items-start justify-between gap-4">
									<div>
										<h1 className="wrap-break-word text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
											{board.project.name}
										</h1>
										<p className="mt-2 max-w-3xl text-sm leading-6 text-paynes_gray-500">
											{board.project.description ||
												"No project description has been added yet."}
										</p>
									</div>
									{canManage ? (
										<ProjectActions
											project={board.project}
											members={board.members}
											workspaceUsers={workspaceUsers}
											role={board.project.role}
										/>
									) : null}
								</div>
								<div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
									<span className="inline-flex items-center gap-2 rounded-xl border border-french_gray-200 px-3 py-2 text-xs text-paynes_gray-500 dark:border-paynes_gray-800">
										<Building2 size={14} />
										{workspace?.name ?? "Workspace"}
									</span>
									<span className="inline-flex items-center gap-2 rounded-xl border border-french_gray-200 px-3 py-2 text-xs text-paynes_gray-500 dark:border-paynes_gray-800">
										<CalendarDays size={14} />
										{board.project.dueDate
											? formatDate(board.project.dueDate)
											: "No deadline"}
									</span>
									<div className="ml-auto">
										<AvatarStack
											users={memberUsers.slice(0, 5)}
											total={board.members.length}
										/>
									</div>
								</div>
							</div>
						</div>
					</header>
					<main className="pt-5">
						<KanbanBoard data={board} />
					</main>
				</div>
				<aside className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:sticky 2xl:top-4 2xl:grid-cols-1">
					<ProjectMembers
						projectId={board.project.id}
						role={board.project.role}
						members={board.members}
						workspaceUsers={workspaceUsers}
					/>
					<ActivityFeed activities={board.activities} />
				</aside>
			</div>
		</div>
	);
}
