import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { requireWorkspaceContext } from "@/lib/auth";
import { getAnalyticsData, getCalendarTasks, getDashboardData, getMyTasks, getRecentWorkspaceActivity } from "@/lib/db";
import { getWorkspaceSummary } from "@/lib/workspaces";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
	const context = await requireWorkspaceContext();
	const input = { userId: context.user.id, workspaceId: context.workspaceId, role: context.role };
	const [data, myTasks, analytics, calendarTasks, activities, workspace] = await Promise.all([
		getDashboardData(input), getMyTasks(input), getAnalyticsData(input), getCalendarTasks(input),
		getRecentWorkspaceActivity(input), getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
	]);
	const now = new Date();
	const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
	const deadlines = calendarTasks.filter((task) => task.dueDate && new Date(task.dueDate) >= now).slice(0, 6);
	const dueSoon = deadlines.filter((task) => new Date(task.dueDate as string) <= weekFromNow).length;
	const hour = now.getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
	const firstName = context.user.name.split(" ")[0];

	return <div className="space-y-6">
		<header>
			<h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">{greeting}, {firstName}.</h1>
			<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">Here&apos;s what&apos;s moving in {workspace.name}.</p>
		</header>
		<DashboardOverview stats={{ ...data.stats, dueSoon }} analytics={analytics} tasks={myTasks} projects={data.projects} activities={activities} deadlines={deadlines} />
	</div>;
}
