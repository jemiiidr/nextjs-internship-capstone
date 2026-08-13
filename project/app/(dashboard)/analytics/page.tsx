import type { Metadata } from "next";
import { DashboardStats } from "@/components/dashboard-stats";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireDbUser } from "@/lib/auth";
import { getDashboardData, getProjectsForUser } from "@/lib/db";

export const metadata: Metadata = { title: "Analytics" };
export default async function AnalyticsPage() {
	const user = await requireDbUser();
	const [dashboard, projects] = await Promise.all([
		getDashboardData(user.id),
		getProjectsForUser(user.id),
	]);
	return (
		<div className="space-y-7">
			<header>
				<h1 className="text-3xl font-bold text-outer_space-900 dark:text-platinum-50">
					Analytics
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">
					A live summary calculated from your accessible projects and tasks.
				</p>
			</header>
			<DashboardStats stats={dashboard.stats} />
			<Card>
				<CardHeader>
					<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
						Project completion
					</h2>
				</CardHeader>
				<CardContent className="space-y-5">
					{projects.length === 0 ? (
						<p className="text-sm text-paynes_gray-500">No project data yet.</p>
					) : (
						projects.map((project) => {
							const progress = project.taskCount
								? Math.round(
										(project.completedTaskCount / project.taskCount) * 100,
									)
								: 0;
							return (
								<div key={project.id}>
									<div className="mb-1.5 flex justify-between gap-4 text-sm">
										<span className="truncate font-medium text-outer_space-500 dark:text-platinum-500">
											{project.name}
										</span>
										<span className="text-paynes_gray-500">
											{progress}% · {project.completedTaskCount}/
											{project.taskCount}
										</span>
									</div>
									<div className="h-2.5 overflow-hidden rounded-full bg-platinum-200 dark:bg-outer_space-300">
										<div
											className="h-full rounded-full bg-blue_munsell-500"
											style={{ width: `${progress}%` }}
										/>
									</div>
								</div>
							);
						})
					)}
				</CardContent>
			</Card>
		</div>
	);
}
