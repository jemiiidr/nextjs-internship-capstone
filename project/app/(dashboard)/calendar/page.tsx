import { CalendarDays } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { requireDbUser } from "@/lib/auth"
import { getCalendarTasks } from "@/lib/db"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = { title: "Calendar" }
export default async function CalendarPage() {
	const user = await requireDbUser()
	const tasks = (await getCalendarTasks(user.id)).filter((task) => task.dueDate)
	const groups = new Map<string, typeof tasks>()
	for (const task of tasks) { const key = task.dueDate?.slice(0, 10) ?? "unscheduled"; groups.set(key, [...(groups.get(key) ?? []), task]) }
	return <div className="space-y-7"><header><h1 className="text-3xl font-bold text-outer_space-900 dark:text-platinum-50">Calendar</h1><p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">Due dates for projects you own and tasks assigned to you.</p></header>{tasks.length === 0 ? <EmptyState icon={<CalendarDays size={22} />} title="No scheduled tasks" description="Add a due date to an assigned task and it will appear here." /> : <div className="space-y-5">{Array.from(groups.entries()).map(([date, items]) => <section key={date}><h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue_munsell-600 dark:text-blue_munsell-300">{formatDate(date)}</h2><div className="space-y-2">{items.map((task) => <Card key={task.id}><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><Link href={`/projects/${task.projectId}`} className="font-medium text-outer_space-500 hover:text-blue_munsell-500 dark:text-platinum-500">{task.title}</Link><p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">{task.projectName} · {task.listName}</p></div><Badge className="capitalize">{task.priority}</Badge></CardContent></Card>)}</div></section>)}</div>}</div>
}
