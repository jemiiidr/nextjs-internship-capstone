import { ArrowUpRight, Clock3, ListTodo, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsData, ProjectSummary } from "@/types";

const statusColors = [
	"#9187f5",
	"#e9be65",
	"#72bada",
	"#76caa5",
	"#e98998",
	"#f5ad78",
];

function TrendChart({ points }: { points: AnalyticsData["completedByDay"] }) {
	const max = Math.max(
		1,
		...points.flatMap((point) => [point.created, point.completed]),
	);
	const width = 700;
	const height = 210;
	const x = (index: number) =>
		points.length <= 1 ? 0 : (index / (points.length - 1)) * width;
	const y = (value: number) => height - (value / max) * (height - 30) - 12;
	const completedPath = points
		.map(
			(point, index) =>
				`${index === 0 ? "M" : "L"}${x(index)},${y(point.completed)}`,
		)
		.join(" ");
	const createdPath = points
		.map(
			(point, index) =>
				`${index === 0 ? "M" : "L"}${x(index)},${y(point.created)}`,
		)
		.join(" ");
	return (
		<div className="overflow-hidden">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="h-56 w-full"
				role="img"
				aria-label="Tasks created and completed over the last 14 days"
			>
				{[0.25, 0.5, 0.75].map((level) => (
					<line
						key={level}
						x1="0"
						x2={width}
						y1={height * level}
						y2={height * level}
						stroke="currentColor"
						className="text-french_gray-200 dark:text-paynes_gray-800"
						strokeDasharray="5 7"
					/>
				))}
				<path
					d={createdPath}
					fill="none"
					stroke="#72bada"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					d={completedPath}
					fill="none"
					stroke="#7467f0"
					strokeWidth="4"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			<div className="flex items-center justify-center gap-5 text-xs text-paynes_gray-500">
				<span className="flex items-center gap-2">
					<span className="size-2 rounded-full bg-[#72bada]" /> Created
				</span>
				<span className="flex items-center gap-2">
					<span className="size-2 rounded-full bg-[#7467f0]" /> Completed
				</span>
			</div>
		</div>
	);
}

export function AnalyticsOverview({
	data,
	projects,
}: {
	data: AnalyticsData;
	projects: ProjectSummary[];
}) {
	const totalStatus = data.status.reduce((sum, item) => sum + item.count, 0);
	const metrics = [
		{
			label: "Completion rate",
			value: `${data.completionRate}%`,
			note: "Across all workspace tasks",
			icon: Target,
			accent: "text-[#6558df] bg-[#f1efff] dark:bg-[#2f2b68]",
		},
		{
			label: "In progress",
			value: data.inProgressTasks,
			note: "Tasks currently moving",
			icon: ListTodo,
			accent: "text-[#b88329] bg-[#fff7e8] dark:bg-[#4c3b20]",
		},
		{
			label: "Overdue",
			value: data.overdueTasks,
			note: "Needs attention",
			icon: Clock3,
			accent: "text-[#c75d6c] bg-[#fff0f2] dark:bg-[#4b2930]",
		},
		{
			label: "Tasks / project",
			value: data.averageTasksPerProject,
			note: "Average workload",
			icon: ArrowUpRight,
			accent: "text-[#479977] bg-[#edf9f3] dark:bg-[#244738]",
		},
	];
	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => (
					<Card key={metric.label}>
						<CardContent className="p-5">
							<span
								className={`grid size-10 place-items-center rounded-xl ${metric.accent}`}
							>
								<metric.icon size={18} />
							</span>
							<p className="mt-4 text-2xl font-bold text-outer_space-900 dark:text-platinum-50">
								{metric.value}
							</p>
							<p className="mt-1 text-sm font-medium text-outer_space-500 dark:text-platinum-300">
								{metric.label}
							</p>
							<p className="mt-0.5 text-xs text-paynes_gray-400">
								{metric.note}
							</p>
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(18rem,.65fr)]">
				<Card>
					<CardContent className="p-5">
						<div>
							<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
								Task flow
							</h2>
							<p className="mt-1 text-xs text-paynes_gray-500">
								Created vs completed over the last 14 days.
							</p>
						</div>
						<div className="mt-4">
							<TrendChart points={data.completedByDay} />
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							Tasks by status
						</h2>
						<p className="mt-1 text-xs text-paynes_gray-500">
							Current distribution across board columns.
						</p>
						<div className="mt-5 space-y-4">
							{data.status.length ? (
								data.status.map((item, index) => {
									const percent = totalStatus
										? Math.round((item.count / totalStatus) * 100)
										: 0;
									return (
										<div key={item.label}>
											<div className="mb-1.5 flex items-center justify-between text-sm">
												<span className="flex items-center gap-2 font-medium text-outer_space-500 dark:text-platinum-300">
													<span
														className="size-2 rounded-full"
														style={{
															backgroundColor:
																statusColors[index % statusColors.length],
														}}
													/>
													{item.label}
												</span>
												<span className="text-xs text-paynes_gray-500">
													{item.count} · {percent}%
												</span>
											</div>
											<div className="h-2 overflow-hidden rounded-full bg-platinum-200 dark:bg-outer_space-300">
												<div
													className="h-full rounded-full"
													style={{
														width: `${percent}%`,
														backgroundColor:
															statusColors[index % statusColors.length],
													}}
												/>
											</div>
										</div>
									);
								})
							) : (
								<p className="text-sm text-paynes_gray-500">
									No task data yet.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			</div>
			<Card>
				<CardContent className="p-5">
					<div className="mb-5">
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							Project performance
						</h2>
						<p className="mt-1 text-xs text-paynes_gray-500">
							Completion progress for every active project.
						</p>
					</div>
					<div className="grid gap-x-8 gap-y-5 lg:grid-cols-2">
						{projects.length ? (
							projects.map((project) => {
								const progress = project.taskCount
									? Math.round(
											(project.completedTaskCount / project.taskCount) * 100,
										)
									: 0;
								return (
									<div key={project.id}>
										<div className="mb-1.5 flex justify-between gap-3 text-sm">
											<span className="truncate font-medium text-outer_space-500 dark:text-platinum-300">
												{project.name}
											</span>
											<span className="text-xs text-paynes_gray-500">
												{progress}%
											</span>
										</div>
										<div className="h-2.5 overflow-hidden rounded-full bg-platinum-200 dark:bg-outer_space-300">
											<div
												className="h-full rounded-full bg-gradient-to-r from-[#7467f0] to-[#72bada]"
												style={{ width: `${progress}%` }}
											/>
										</div>
									</div>
								);
							})
						) : (
							<p className="text-sm text-paynes_gray-500">
								No project data yet.
							</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
