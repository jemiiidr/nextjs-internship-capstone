import { ArrowRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { Card, CardContent } from "@/components/ui/card";
import { requireWorkspaceContext } from "@/lib/auth";
import { getDashboardData, getMyTasks } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { hasPermission } from "@/lib/rbac";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
	const context = await requireWorkspaceContext();
	const input = {
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
	};
	const [data, myTasks] = await Promise.all([
		getDashboardData(input),
		getMyTasks(input),
	]);
	const firstName = context.user.name.split(" ")[0];
	return (
		<div className="space-y-8">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="flex items-center gap-2 text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						<Sparkles size={15} /> Welcome back, {firstName}
					</div>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Here’s what’s happening today.
					</h1>
					<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">
						A focused view of progress, deadlines, and the work waiting for you.
					</p>
				</div>
				{hasPermission(context.role, "project:create") ? <CreateProjectButton /> : null}
			</header>

			<DashboardStats stats={data.stats} />

			<div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,.7fr)]">
			<RecentProjects projects={data.projects} canCreate={hasPermission(context.role, "project:create")} />
				<Card>
					<CardContent className="p-5">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
									My upcoming tasks
								</h2>
								<p className="mt-1 text-xs text-paynes_gray-500">
									Assigned to you in this workspace.
								</p>
							</div>
							<Link
								href="/my-tasks"
								className="text-xs font-semibold text-blue_munsell-600"
							>
								View all
							</Link>
						</div>
						<div className="mt-4 space-y-2.5">
							{myTasks.slice(0, 5).map((task) => (
								<Link
									key={task.id}
									href={`/projects/${task.projectId}`}
									className="flex items-center gap-3 rounded-xl border border-french_gray-200 p-3 transition hover:border-blue_munsell-200 hover:bg-blue_munsell-50/30 dark:border-paynes_gray-800 dark:hover:bg-blue_munsell-900/20"
								>
									<span
										className={`size-2 shrink-0 rounded-full ${task.priority === "high" ? "bg-[#e98998]" : task.priority === "medium" ? "bg-[#e9be65]" : "bg-[#76caa5]"}`}
									/>
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-medium text-outer_space-900 dark:text-platinum-50">
											{task.title}
										</span>
										<span className="block truncate text-xs text-paynes_gray-500">
											{task.projectName} · {task.listName}
										</span>
									</span>
									<span className="shrink-0 text-[11px] text-paynes_gray-400">
										{task.dueDate
											? formatDate(task.dueDate, { year: undefined })
											: "No date"}
									</span>
								</Link>
							))}
							{myTasks.length === 0 ? (
								<p className="rounded-xl bg-platinum-100 p-4 text-sm text-paynes_gray-500 dark:bg-outer_space-400">
									No tasks assigned yet.
								</p>
							) : null}
						</div>
						<Link
							href="/projects"
							className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue_munsell-600"
						>
							Browse projects <ArrowRight size={13} />
						</Link>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
