"use client";

import {
	AlertCircle,
	CheckCircle2,
	Clock3,
	FolderKanban,
	TrendingUp,
} from "lucide-react";
import Image from "next/image";
import {
	CartesianGrid,
	Cell,
	Label,
	Line,
	LineChart,
	Pie,
	PieChart,
	XAxis,
	YAxis,
} from "recharts";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { AnalyticsData, ProjectSummary } from "@/types";

const COLORS = [
	"#7467f0",
	"#ff746d",
	"#f5ad3d",
	"#47c7a1",
	"#4ba3f2",
	"#e989b8",
];

const flowChartConfig = {
	completed: { label: "Completed", color: "#47c7a1" },
	created: { label: "Created", color: "#7467f0" },
	overdue: { label: "Overdue", color: "#ff654f" },
} satisfies ChartConfig;

const statusChartConfig = {
	count: { label: "Tasks" },
} satisfies ChartConfig;

const formatChartDate = (value: string) =>
	new Date(`${value}T00:00:00`).toLocaleDateString("en", {
		month: "short",
		day: "numeric",
	});

function FlowChart({ points }: { points: AnalyticsData["completedByDay"] }) {
	return (
		<div className="overflow-x-auto">
			<div className="min-w-190">
				<div className="mb-3 flex flex-wrap gap-5 text-xs text-paynes_gray-500">
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
				<ChartContainer
					config={flowChartConfig}
					className="h-64 min-h-0 w-full aspect-auto sm:h-72"
				>
					<LineChart
						accessibilityLayer
						data={points}
						margin={{ left: 4, right: 10 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							dataKey="date"
							tickLine={false}
							axisLine={false}
							tickMargin={10}
							tickFormatter={formatChartDate}
						/>
						<YAxis
							allowDecimals={false}
							tickLine={false}
							axisLine={false}
							width={28}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									labelFormatter={(value) => formatChartDate(String(value))}
									indicator="line"
								/>
							}
						/>
						<Line
							dataKey="completed"
							type="monotone"
							stroke="var(--color-completed)"
							strokeWidth={2.5}
							dot={{ r: 3, fill: "var(--color-completed)" }}
							activeDot={{ r: 5 }}
						/>
						<Line
							dataKey="created"
							type="monotone"
							stroke="var(--color-created)"
							strokeWidth={2.5}
							dot={{ r: 3, fill: "var(--color-created)" }}
							activeDot={{ r: 5 }}
						/>
						<Line
							dataKey="overdue"
							type="monotone"
							stroke="var(--color-overdue)"
							strokeWidth={2.5}
							dot={{ r: 3, fill: "var(--color-overdue)" }}
							activeDot={{ r: 5 }}
						/>
					</LineChart>
				</ChartContainer>
			</div>
		</div>
	);
}

function StatusDonut({ data }: { data: AnalyticsData["status"] }) {
	const total = data.reduce((sum, item) => sum + item.count, 0);
	const chartData = data.map((item, index) => ({
		...item,
		fill: COLORS[index % COLORS.length],
	}));
	return (
		<div className="mt-7 flex flex-col items-center gap-6 sm:flex-row">
			<ChartContainer
				config={statusChartConfig}
				className="aspect-square size-40 shrink-0"
			>
				<PieChart accessibilityLayer>
					<ChartTooltip
						cursor={false}
						content={<ChartTooltipContent hideLabel nameKey="label" />}
					/>
					<Pie
						data={chartData}
						dataKey="count"
						nameKey="label"
						innerRadius={48}
						outerRadius={72}
						strokeWidth={2}
					>
						{chartData.map((item) => (
							<Cell key={item.label} fill={item.fill} />
						))}
						<Label
							content={({ viewBox }) =>
								viewBox && "cx" in viewBox && "cy" in viewBox ? (
									<text
										x={viewBox.cx}
										y={viewBox.cy}
										textAnchor="middle"
										dominantBaseline="middle"
									>
										<tspan
											x={viewBox.cx}
											y={viewBox.cy}
											className="fill-outer_space-900 text-xl font-bold dark:fill-platinum-50"
										>
											{total}
										</tspan>
										<tspan
											x={viewBox.cx}
											y={(viewBox.cy ?? 0) + 17}
											className="fill-paynes_gray-500 text-[10px]"
										>
											tasks
										</tspan>
									</text>
								) : null
							}
						/>
					</Pie>
				</PieChart>
			</ChartContainer>
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
