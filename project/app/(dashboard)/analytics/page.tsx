import type { Metadata } from "next";
import { AnalyticsExport } from "@/components/analytics/analytics-export";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { AnalyticsRange } from "@/components/analytics/analytics-range";
import { requireWorkspaceContext } from "@/lib/auth";
import { getAnalyticsData, getProjectsForUser } from "@/lib/db";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
	const context = await requireWorkspaceContext();
	const params = await searchParams;
	const requestedDays = Number.parseInt(params.days ?? "14", 10);
	const days = [7, 14, 30, 90].includes(requestedDays) ? requestedDays : 14;
	const input = {
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
	};
	const [analytics, projects] = await Promise.all([
		getAnalyticsData({ ...input, days }),
		getProjectsForUser(input),
	]);
	return (
		<div className="space-y-7">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
					Analytics
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">
					Track performance and discover insights across your team’s work.
				</p>
				</div>
				<div className="flex items-center gap-2"><AnalyticsRange days={days} /><AnalyticsExport data={analytics} projects={projects} /></div>
			</header>
			<AnalyticsOverview data={analytics} projects={projects} />
		</div>
	);
}
