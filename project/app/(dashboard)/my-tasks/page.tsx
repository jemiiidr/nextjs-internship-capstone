import { CalendarDays, CheckSquare2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireWorkspaceContext } from "@/lib/auth";
import { getMyTasks } from "@/lib/db";
import { decodeLabel, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "My Tasks" };

export default async function MyTasksPage() {
	const context = await requireWorkspaceContext();
	const tasks = await getMyTasks({
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
	});
	return (
		<div className="space-y-6">
			<header>
				<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
					Personal focus
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
					My Tasks
				</h1>
				<p className="mt-2 text-paynes_gray-500">
					Everything assigned to you in the active workspace.
				</p>
			</header>
			<Card className="overflow-hidden">
				<CardContent className="p-0">
					{tasks.length === 0 ? (
						<div className="grid min-h-60 place-items-center p-8 text-center">
							<div>
								<CheckSquare2 className="mx-auto text-blue_munsell-400" />
								<h2 className="mt-3 font-semibold">Nothing assigned yet</h2>
								<p className="mt-1 text-sm text-paynes_gray-500">
									Assigned tasks will appear here automatically.
								</p>
							</div>
						</div>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[760px] text-left text-sm">
								<thead className="border-b border-french_gray-200 bg-platinum-100/70 text-xs uppercase tracking-wide text-paynes_gray-400 dark:border-paynes_gray-800 dark:bg-outer_space-400">
									<tr>
										<th className="px-5 py-3 font-semibold">Task</th>
										<th className="px-4 py-3 font-semibold">Project</th>
										<th className="px-4 py-3 font-semibold">Status</th>
										<th className="px-4 py-3 font-semibold">Priority</th>
										<th className="px-5 py-3 font-semibold">Due</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-french_gray-200 dark:divide-paynes_gray-800">
									{tasks.map((task) => (
										<tr
											key={task.id}
											className="transition hover:bg-platinum-50 dark:hover:bg-outer_space-400/50"
										>
											<td className="px-5 py-4">
												<Link
													href={`/projects/${task.projectId}`}
													className="font-medium text-outer_space-900 hover:text-blue_munsell-600 dark:text-platinum-50"
												>
													{task.title}
												</Link>
												{task.labels.length ? (
													<div className="mt-1 flex gap-1">
												{task.labels.slice(0, 2).map((label) => {
													const decoded = decodeLabel(label);
													return <span key={label} className="rounded-full border px-2 py-0.5 text-[10px] font-medium" style={{ borderColor: `${decoded.color}55`, backgroundColor: `${decoded.color}18`, color: decoded.color }}>{decoded.name}</span>;
												})}
													</div>
												) : null}
											</td>
											<td className="px-4 py-4 text-paynes_gray-500">
												{task.projectName}
											</td>
											<td className="px-4 py-4">
												<Badge>{task.listName}</Badge>
											</td>
											<td className="px-4 py-4">
												<span
													className={`inline-flex items-center gap-1.5 capitalize ${task.priority === "high" ? "text-rose-600" : task.priority === "medium" ? "text-amber-600" : "text-emerald-600"}`}
												>
													<span className="size-1.5 rounded-full bg-current" />
													{task.priority}
												</span>
											</td>
											<td className="px-5 py-4 text-paynes_gray-500">
												<span className="inline-flex items-center gap-1.5">
													<CalendarDays size={14} />{" "}
													{task.dueDate
														? formatDate(task.dueDate, { year: undefined })
														: "No date"}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
