import type { Metadata } from "next";
import { AnalyticsOverview } from "@/components/analytics/analytics-overview";
import { requireWorkspaceContext } from "@/lib/auth";
import { getAnalyticsData, getProjectsForUser } from "@/lib/db";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
	const context = await requireWorkspaceContext();
	const input = {
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
	};
	const [analytics, projects] = await Promise.all([
		getAnalyticsData(input),
		getProjectsForUser(input),
	]);
	return (
		<div className="space-y-7">
			<header>
				<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
					Workspace performance
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
					Analytics
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">
					See throughput, workload, completion, and project health without
					leaving Kanvas.
				</p>
			</header>
			<AnalyticsOverview data={analytics} projects={projects} />
		</div>
	);
}
