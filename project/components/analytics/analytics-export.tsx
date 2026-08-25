"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnalyticsData, ProjectSummary } from "@/types";

export function AnalyticsExport({
	data,
	projects,
}: {
	data: AnalyticsData;
	projects: ProjectSummary[];
}) {
	const download = () => {
		const rows = [
			["Metric", "Value"],
			["Tasks completed", data.completedTasks],
			["Overdue tasks", data.overdueTasks],
			["Throughput per day", data.throughput],
			["Average cycle time (days)", data.averageCycleTimeDays],
			[],
			["Project", "Tasks", "Completed", "Completion %"],
			...projects.map((project) => [
				project.name,
				project.taskCount,
				project.completedTaskCount,
				project.taskCount
					? Math.round((project.completedTaskCount / project.taskCount) * 100)
					: 0,
			]),
		];
		const csv = rows
			.map((row) =>
				row
					.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
					.join(","),
			)
			.join("\n");
		const url = URL.createObjectURL(
			new Blob([csv], { type: "text/csv;charset=utf-8" }),
		);
		const link = document.createElement("a");
		link.href = url;
		link.download = `kanvas-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	};
	return (
		<Button variant="secondary" onClick={download}>
			<Download size={16} /> Export
		</Button>
	);
}
