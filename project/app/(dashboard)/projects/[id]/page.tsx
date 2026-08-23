import { ArrowLeft, CalendarDays, LayoutGrid, ListFilter } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityFeed } from "@/components/project-detail/activity-feed";
import { KanbanBoard } from "@/components/project-detail/kanban-board";
import { ProjectMembers } from "@/components/project-detail/project-members";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Badge } from "@/components/ui/badge";
import { getWorkspaceContext } from "@/lib/auth";
import { getProjectBoard } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { getWorkspaceMembers } from "@/lib/workspaces";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;

	return {
		title: `Project ${id.slice(0, 8)}`,
	};
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

	if (!board) {
		notFound();
	}

	const workspaceUsers = board.project.workspaceId
		? await getWorkspaceMembers(board.project.workspaceId)
		: [];

	const memberUsers = board.members.map((member) => member.user);

	return (
		<div className="min-w-0 space-y-5">
			<header className="flowora-panel rounded-2xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-800 dark:bg-outer_space-500">
				<Link
					href="/projects"
					className="inline-flex items-center gap-1.5 text-xs font-semibold text-paynes_gray-500 transition hover:text-blue_munsell-600"
				>
					<ArrowLeft size={14} />
					All projects
				</Link>

				<div className="mt-4 flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
					<div className="min-w-0 flex-1">
						<div className="flex flex-wrap items-center gap-2">
							<h1 className="min-w-0 wrap-break-word text-2xl font-bold tracking-tight text-outer_space-900 sm:text-3xl dark:text-platinum-50">
								{board.project.name}
							</h1>

							<Badge className="capitalize">{board.project.role}</Badge>

							{board.project.workspaceId ? (
								<Badge>Workspace</Badge>
							) : (
								<Badge>Legacy project</Badge>
							)}
						</div>

						<p className="mt-2 max-w-3xl text-sm leading-6 text-paynes_gray-500">
							{board.project.description || "No project description."}
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						<AvatarStack users={memberUsers} total={board.members.length} />

						<p className="flex items-center gap-2 text-sm text-paynes_gray-500">
							<CalendarDays size={15} />

							{formatDate(board.project.dueDate)}
						</p>
					</div>
				</div>

				<div className="mt-5 flex items-center gap-1 border-t border-french_gray-200 pt-3 dark:border-paynes_gray-800">
					<span className="inline-flex items-center gap-2 rounded-lg bg-blue_munsell-50 px-3 py-2 text-xs font-semibold text-blue_munsell-700 dark:bg-blue_munsell-900/35 dark:text-blue_munsell-200">
						<LayoutGrid size={14} />
						Board
					</span>

					<Link
						href="/calendar"
						className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-paynes_gray-500 hover:bg-platinum-100"
					>
						<CalendarDays size={14} />
						Calendar
					</Link>

					<span className="ml-auto hidden items-center gap-1 text-xs text-paynes_gray-400 sm:flex">
						<ListFilter size={13} />
						Filters are available below
					</span>
				</div>
			</header>

			<div className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1fr)_19rem]">
				<main className="min-w-0">
					<KanbanBoard data={board} />
				</main>

				<aside className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-1">
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
