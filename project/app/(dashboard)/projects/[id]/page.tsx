import { ArrowLeft, CalendarDays, Lock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { KanbanBoard } from "@/components/kanban-board";
import { ActivityFeed } from "@/components/projects/activity-feed";
import { ProjectMembers } from "@/components/projects/project-members";
import { Badge } from "@/components/ui/badge";
import { requireDbUser } from "@/lib/auth";
import { getProjectBoard, getWorkspaceUsers } from "@/lib/db";
import { formatDate } from "@/lib/utils";

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
	const user = await requireDbUser();

	const [board, workspaceUsers] = await Promise.all([
		getProjectBoard(id, user.id),
		getWorkspaceUsers(),
	]);

	if (!board) {
		notFound();
	}

	return (
		<div className="min-w-0 space-y-4 sm:space-y-6">
			{/* Project Header */}
			<header className="min-w-0">
				<Link
					href="/projects"
					className="inline-flex items-center gap-1 text-sm text-paynes_gray-500 transition-colors hover:text-blue_munsell-500 dark:text-french_gray-400"
				>
					<ArrowLeft size={15} />
					<span>All projects</span>
				</Link>

				<div className="mt-3 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					{/* Project Information */}
					<div className="min-w-0 flex-1">
						<div className="flex min-w-0 flex-wrap items-center gap-2">
							<h1 className="min-w-0 wrap-break-word text-2xl font-bold text-outer_space-900 sm:text-3xl dark:text-platinum-50">
								{board.project.name}
							</h1>

							<Badge className="shrink-0 capitalize">
								{board.project.role}
							</Badge>

							{board.project.visibility === "private" ? (
								<Badge className="shrink-0">
									<Lock size={11} />
									Private
								</Badge>
							) : (
								<Badge className="shrink-0">Workspace</Badge>
							)}
						</div>

						<p className="mt-2 max-w-3xl wrap-break-word text-sm leading-relaxed text-paynes_gray-500 sm:text-base dark:text-french_gray-400">
							{board.project.description || "No project description."}
						</p>
					</div>

					{/* Due Date */}
					<div className="shrink-0">
						<p className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
							<CalendarDays size={16} className="shrink-0" />

							<span>{formatDate(board.project.dueDate)}</span>
						</p>
					</div>
				</div>
			</header>

			{/* Main Project Content */}
			<div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-6 2xl:grid-cols-[minmax(0,1fr)_20rem]">
				{/* Kanban */}
				<main className="min-w-0">
					<div className="w-full overflow-x-auto pb-2">
						<KanbanBoard data={board} />
					</div>
				</main>

				{/* Sidebar */}
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
