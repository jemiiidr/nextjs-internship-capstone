import {
	AlertCircle,
	CheckCircle2,
	Clock3,
	FolderKanban,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyticsData, ProjectSummary } from "@/types";

const COLORS = [
	"#7467f0",
	"#ff746d",
	"#f5ad3d",
	"#47c7a1",
	"#4ba3f2",
	"#e989b8",
];

function FlowChart({ points }: { points: AnalyticsData["completedByDay"] }) {
	const max = Math.max(
		1,
		...points.flatMap((point) => [
			point.created,
			point.completed,
			point.overdue,
		]),
	);
	const width = 1000;
	const height = 190;
	const x = (index: number) =>
		points.length <= 1 ? 0 : (index / (points.length - 1)) * width;
	const y = (value: number) => height - 20 - (value / max) * 145;
	const path = (key: "created" | "completed" | "overdue") =>
		points
			.map((point, index) => `${index ? "L" : "M"}${x(index)},${y(point[key])}`)
			.join(" ");
	return (
		<div className="overflow-x-auto">
			<div className="min-w-190">
				<div className="mb-3 flex gap-5 text-xs text-paynes_gray-500">
					<span className="flex items-center gap-2">
						<i className="size-2 rounded-full bg-[#47c7a1]" /> Completed
					</span>
					<span className="flex items-center gap-2">
						<i className="size-2 rounded-full bg-[#7467f0]" /> Created
					</span>
					<span className="flex items-center gap-2">
						<i className="size-2 rounded-full bg-[#ff654f]" /> Overdue
					</span>
				</div>
				<svg
					viewBox={`0 0 ${width} ${height}`}
					className="h-52 w-full"
					role="img"
					aria-label="Fourteen-day task flow"
				>
					{[0.2, 0.4, 0.6, 0.8].map((level) => (
						<line
							key={level}
							x1="0"
							x2={width}
							y1={height * level}
							y2={height * level}
							stroke="currentColor"
							className="text-french_gray-200 dark:text-paynes_gray-800"
						/>
					))}
					<path
						d={path("created")}
						fill="none"
						stroke="#7467f0"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d={path("completed")}
						fill="none"
						stroke="#47c7a1"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d={path("overdue")}
						fill="none"
						stroke="#ff654f"
						strokeWidth="3"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					{points.map((point, index) => (
						<g key={point.date}>
							<circle
								cx={x(index)}
								cy={y(point.created)}
								r="3"
								fill="#7467f0"
							/>
							<circle
								cx={x(index)}
								cy={y(point.completed)}
								r="3"
								fill="#47c7a1"
							/>
							<text
								x={x(index)}
								y={height - 2}
								textAnchor="middle"
								className="fill-paynes_gray-400 text-[9px]"
							>
								{new Date(`${point.date}T00:00:00`).toLocaleDateString("en", {
									month: "short",
									day: "numeric",
								})}
							</text>
						</g>
					))}
				</svg>
			</div>
		</div>
	);
}

function StatusDonut({ data }: { data: AnalyticsData["status"] }) {
	const total = data.reduce((sum, item) => sum + item.count, 0);
	let cursor = 0;
	const stops = data.map((item, index) => {
		const start = cursor;
		cursor += total ? (item.count / total) * 100 : 0;
		return `${COLORS[index % COLORS.length]} ${start}% ${cursor}%`;
	});
	return (
		<div className="mt-7 flex flex-col items-center gap-6 sm:flex-row">
			<div
				className="relative size-40 shrink-0 rounded-full"
				style={{
					background: total ? `conic-gradient(${stops.join(",")})` : "#e9e9ef",
				}}
			>
				<div className="absolute inset-9 grid place-items-center rounded-full bg-white text-center dark:bg-outer_space-500">
					<span>
						<strong className="block text-xl">{total}</strong>
						<span className="text-[10px] text-paynes_gray-500">tasks</span>
					</span>
				</div>
			</div>
			<div className="w-full space-y-3">
				{data.map((item, index) => {
					const percent = total ? Math.round((item.count / total) * 100) : 0;
					return (
						<div key={item.label} className="flex items-center gap-2 text-xs">
							<span
								className="size-2.5 rounded-full"
								style={{ backgroundColor: COLORS[index % COLORS.length] }}
							/>
							<span className="min-w-0 flex-1 truncate">{item.label}</span>
							<strong>{percent}%</strong>
							<span className="w-6 text-right text-paynes_gray-400">
								{item.count}
							</span>
						</div>
					);
				})}
				{!data.length ? (
					<p className="text-sm text-paynes_gray-500">No task data yet.</p>
				) : null}
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
	const metrics = [
		{
			label: "Tasks Completed",
			value: data.completedTasks,
			note: "Completed across this workspace",
			icon: CheckCircle2,
			tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40",
		},
		{
			label: "Overdue Tasks",
			value: data.overdueTasks,
			note: "Tasks currently past deadline",
			icon: AlertCircle,
			tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/40",
		},
		{
			label: "Throughput",
			value: data.throughput,
			note: "Completed tasks per day",
			icon: TrendingUp,
			tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/40",
		},
		{
			label: "Avg. Cycle Time",
			value: `${data.averageCycleTimeDays} days`,
			note: "Creation to completion",
			icon: Clock3,
			tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/40",
		},
	];
	const topProjects = [...projects]
		.sort((a, b) => b.completedTaskCount - a.completedTaskCount)
		.slice(0, 5);
	return (
		<div className="space-y-5">
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{metrics.map((metric) => (
					<Card key={metric.label}>
						<CardContent className="flex items-center gap-4 p-5">
							<span
								className={`grid size-14 shrink-0 place-items-center rounded-full ${metric.tone}`}
							>
								<metric.icon size={25} />
							</span>
							<div>
								<p className="text-sm font-medium text-outer_space-900 dark:text-platinum-50">
									{metric.label}
								</p>
								<p className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
									{metric.value}
								</p>
								<p className="mt-1 text-[11px] text-paynes_gray-500">
									{metric.note}
								</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-5 xl:grid-cols-[.9fr_1fr_1fr]">
				<Card>
					<CardContent className="p-5">
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							Tasks by Status
						</h2>
						<StatusDonut data={data.status} />
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							Top Projects
						</h2>
						<div className="mt-4 space-y-4">
							{topProjects.map((project, index) => {
								const progress = project.taskCount
									? Math.round(
											(project.completedTaskCount / project.taskCount) * 100,
										)
									: 0;
								return (
									<div key={project.id} className="flex items-center gap-3">
										{project.iconDataUrl ? (
											<span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
												<Image
													src={project.iconDataUrl}
													alt=""
													fill
													sizes="36px"
													className="object-cover"
												/>
											</span>
										) : (
											<span
												className="grid size-9 shrink-0 place-items-center rounded-lg text-white"
												style={{
													backgroundColor: COLORS[index % COLORS.length],
												}}
											>
												<FolderKanban size={16} />
											</span>
										)}
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium">
												{project.name}
											</p>
											<p className="text-[10px] text-paynes_gray-500">
												{project.taskCount} tasks
											</p>
										</div>
										<div className="w-28">
											<div className="h-1.5 overflow-hidden rounded-full bg-platinum-200 dark:bg-outer_space-300">
												<div
													className="h-full rounded-full"
													style={{
														width: `${progress}%`,
														backgroundColor: COLORS[index % COLORS.length],
													}}
												/>
											</div>
										</div>
										<strong className="w-9 text-right text-xs">
											{progress}%
										</strong>
									</div>
								);
							})}
							{!topProjects.length ? (
								<p className="text-sm text-paynes_gray-500">No projects yet.</p>
							) : null}
						</div>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-5">
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							Team Workload
						</h2>
						<div className="mt-4">
							<div className="grid grid-cols-[1.3fr_.6fr_1fr] border-b border-french_gray-200 pb-2 text-[10px] text-paynes_gray-500 dark:border-paynes_gray-700">
								<span>Member</span>
								<span>Active</span>
								<span>Completion</span>
							</div>
							{data.workload.slice(0, 6).map((item, index) => {
								const total = item.activeTasks + item.completedTasks;
								const percent = total
									? Math.round((item.completedTasks / total) * 100)
									: 0;
								return (
									<div
										key={item.member.id}
										className="grid grid-cols-[1.3fr_.6fr_1fr] items-center py-2.5 text-xs"
									>
										<span className="flex min-w-0 items-center gap-2">
											<Avatar
												name={item.member.name}
												src={item.member.avatarUrl}
												className="size-8"
											/>
											<span className="truncate">{item.member.name}</span>
										</span>
										<span>{item.activeTasks}</span>
										<span className="flex items-center gap-2">
											<span className="h-1.5 flex-1 overflow-hidden rounded-full bg-platinum-200 dark:bg-outer_space-300">
												<i
													className="block h-full rounded-full"
													style={{
														width: `${percent}%`,
														backgroundColor: COLORS[index % COLORS.length],
													}}
												/>
											</span>
											<strong>{percent}%</strong>
										</span>
									</div>
								);
							})}
							{!data.workload.length ? (
								<p className="py-7 text-center text-sm text-paynes_gray-500">
									No workload data yet.
								</p>
							) : null}
						</div>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardContent className="p-5">
					<div className="flex items-center justify-between">
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							{data.periodDays}-Day Task Flow
						</h2>
						<span className="rounded-lg border border-french_gray-300 px-3 py-1.5 text-xs dark:border-paynes_gray-700">
							Daily
						</span>
					</div>
					<div className="mt-5">
						<FlowChart points={data.completedByDay} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
