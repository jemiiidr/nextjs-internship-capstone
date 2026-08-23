import {
	CalendarClock,
	CheckCircle2,
	FolderKanban,
	ListChecks,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardStats({
	stats,
}: {
	stats: {
		projectCount: number;
		totalTasks: number;
		completedTasks: number;
		dueSoon: number;
	};
}) {
	const items = [
		{
			label: "Total projects",
			value: stats.projectCount,
			icon: FolderKanban,
			accent: "bg-[#f1efff] text-[#6558df] dark:bg-[#2f2b68]",
		},
		{
			label: "Total tasks",
			value: stats.totalTasks,
			icon: ListChecks,
			accent: "bg-[#fff0f5] text-[#c76193] dark:bg-[#4b293d]",
		},
		{
			label: "Completed",
			value: stats.completedTasks,
			icon: CheckCircle2,
			accent: "bg-[#edf9f3] text-[#479977] dark:bg-[#244738]",
		},
		{
			label: "Due this week",
			value: stats.dueSoon,
			icon: CalendarClock,
			accent: "bg-[#fff7e8] text-[#b88329] dark:bg-[#4c3b20]",
		},
	];
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{items.map((item) => (
				<Card key={item.label}>
					<CardContent className="flex items-center gap-4 p-5">
						<span
							className={`grid size-11 place-items-center rounded-2xl ${item.accent}`}
						>
							<item.icon size={20} />
						</span>
						<div>
							<p className="text-2xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
								{item.value}
							</p>
							<p className="mt-0.5 text-sm text-paynes_gray-500">
								{item.label}
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
