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
		{ label: "Projects", value: stats.projectCount, icon: FolderKanban },
		{ label: "Total tasks", value: stats.totalTasks, icon: ListChecks },
		{ label: "Completed", value: stats.completedTasks, icon: CheckCircle2 },
		{ label: "Due this week", value: stats.dueSoon, icon: CalendarClock },
	];
	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{items.map((item) => (
				<Card key={item.label}>
					<CardContent className="flex items-center gap-4 p-5">
						<span className="grid size-11 place-items-center rounded-xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
							<item.icon size={21} />
						</span>
						<div>
							<p className="text-2xl font-bold text-outer_space-900 dark:text-platinum-50">
								{item.value}
							</p>
							<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
								{item.label}
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
