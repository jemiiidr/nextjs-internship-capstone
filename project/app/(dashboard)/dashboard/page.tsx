import type { Metadata } from "next"
import { CreateProjectButton } from "@/components/create-project-button"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentProjects } from "@/components/recent-projects"
import { requireDbUser } from "@/lib/auth"
import { getDashboardData } from "@/lib/db"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
	const user = await requireDbUser()
	const data = await getDashboardData(user.id)
	return <div className="space-y-8"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-blue_munsell-600 dark:text-blue_munsell-300">Welcome back, {user.name.split(" ")[0]}</p><h1 className="mt-1 text-3xl font-bold text-outer_space-900 dark:text-platinum-50">Workspace overview</h1><p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">Review progress and jump back into active projects.</p></div><CreateProjectButton /></header><DashboardStats stats={data.stats} /><RecentProjects projects={data.projects} /></div>
}
