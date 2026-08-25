import { ChevronDown, ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireWorkspaceContext } from "@/lib/auth";
import { getCalendarTasks } from "@/lib/db";
import { cn } from "@/lib/utils";
import { getWorkspaceSummary } from "@/lib/workspaces";

export const metadata: Metadata = { title: "Calendar" };
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value: number) { return String(value).padStart(2, "0"); }
function dateKey(year: number, month: number, day: number) { return `${year}-${pad(month + 1)}-${pad(day)}`; }
function monthKey(year: number, month: number) { return `${year}-${pad(month + 1)}`; }
function parseMonth(value?: string) {
	const now = new Date();
	const match = value ? /^(\d{4})-(\d{2})$/.exec(value) : null;
	if (!match) return { year: now.getFullYear(), month: now.getMonth() };
	const year = Number(match[1]);
	const month = Number(match[2]) - 1;
	return month >= 0 && month <= 11 ? { year, month } : { year: now.getFullYear(), month: now.getMonth() };
}
function adjacentMonth(year: number, month: number, offset: number) {
	const date = new Date(year, month + offset, 1);
	return { year: date.getFullYear(), month: date.getMonth() };
}
function priorityDot(priority: string) {
	if (priority === "high") return "bg-rose-500";
	if (priority === "medium") return "bg-amber-500";
	return "bg-emerald-500";
}
function priorityCard(priority: string) {
	if (priority === "high") return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-200";
	if (priority === "medium") return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200";
	return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200";
}

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
	const context = await requireWorkspaceContext();
	const params = await searchParams;
	const [calendarTasks, workspace] = await Promise.all([
		getCalendarTasks({ userId: context.user.id, workspaceId: context.workspaceId, role: context.role }),
		getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
	]);
	const tasks = calendarTasks.filter((task) => task.dueDate);
	const { year, month } = parseMonth(params.month);
	const firstDay = new Date(year, month, 1);
	const previousMonth = adjacentMonth(year, month, -1);
	const nextMonth = adjacentMonth(year, month, 1);
	const calendarDays = Array.from({ length: 42 }, (_, index) => {
		const date = new Date(year, month, index - firstDay.getDay() + 1);
		return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), isCurrentMonth: date.getMonth() === month && date.getFullYear() === year };
	});
	const taskGroups = new Map<string, typeof tasks>();
	for (const task of tasks) {
		if (!task.dueDate) continue;
		const key = task.dueDate.slice(0, 10);
		taskGroups.set(key, [...(taskGroups.get(key) ?? []), task]);
	}
	const today = new Date();
	const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());
	const monthTitle = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(firstDay);
	const upcoming = tasks.filter((task) => (task.dueDate?.slice(0, 10) ?? "") >= todayKey).slice(0, 5);
	const todayTasks = taskGroups.get(todayKey) ?? [];

	return <div className="min-w-0 space-y-6">
		<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
			<div><h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">Calendar</h1><p className="mt-1 text-paynes_gray-500 dark:text-french_gray-400">{workspace.name}</p></div>
			<div className="flex items-center gap-2"><Button variant="secondary"><SlidersHorizontal size={16} /> Customize</Button><Link href="/projects"><Button><Plus size={16} /> New <ChevronDown size={14} /></Button></Link></div>
		</header>

		<div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_19rem]">
			<div className="min-w-0 space-y-4">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-wrap items-center gap-2">
						<div className="flex"><Link href={`/calendar?month=${monthKey(previousMonth.year, previousMonth.month)}`}><Button variant="secondary" size="icon" className="rounded-r-md" aria-label="Previous month"><ChevronLeft size={17} /></Button></Link><Link href={`/calendar?month=${monthKey(nextMonth.year, nextMonth.month)}`}><Button variant="secondary" size="icon" className="-ml-px rounded-l-md" aria-label="Next month"><ChevronRight size={17} /></Button></Link></div>
						<div className="flex h-10 items-center gap-3 rounded-xl border border-french_gray-300 bg-white px-4 text-sm font-medium shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-400">{monthTitle}<ChevronDown size={14} className="text-paynes_gray-400" /></div>
						<Link href={`/calendar?month=${monthKey(today.getFullYear(), today.getMonth())}`}><Button variant="secondary">Today</Button></Link>
					</div>
					<div className="grid grid-cols-3 rounded-xl border border-french_gray-300 bg-white p-1 dark:border-paynes_gray-700 dark:bg-outer_space-400"><button type="button" className="rounded-lg bg-blue_munsell-500 px-5 py-2 text-sm font-medium text-white">Month</button><button type="button" className="px-5 py-2 text-sm font-medium text-paynes_gray-500">Week</button><button type="button" className="px-5 py-2 text-sm font-medium text-paynes_gray-500">Agenda</button></div>
				</div>

				<section className="overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-700 dark:bg-outer_space-500">
					<div className="overflow-x-auto"><div className="min-w-190">
						<div className="grid grid-cols-7">{WEEKDAYS.map((day) => <div key={day} className="px-3 py-3 text-center text-xs font-semibold text-paynes_gray-500">{day}</div>)}</div>
						<div className="grid grid-cols-7 border-l border-t border-french_gray-200 dark:border-paynes_gray-700">
							{calendarDays.map((calendarDay) => {
								const key = dateKey(calendarDay.year, calendarDay.month, calendarDay.day);
								const dayTasks = taskGroups.get(key) ?? [];
								const isToday = key === todayKey;
								return <div key={key} className={cn("min-h-28 border-b border-r border-french_gray-200 p-2 dark:border-paynes_gray-700", calendarDay.isCurrentMonth ? "bg-white dark:bg-outer_space-500" : "bg-platinum-50/60 dark:bg-outer_space-600/40")}>
									<span className={cn("grid size-7 place-items-center rounded-full text-sm", !calendarDay.isCurrentMonth && "text-french_gray-400", isToday && "bg-blue_munsell-500 font-semibold text-white")}>{calendarDay.day}</span>
									<div className="mt-1 space-y-1">{dayTasks.slice(0, 2).map((task) => <Link key={task.id} href={`/projects/${task.projectId}`} title={`${task.title} — ${task.projectName}`} className={cn("block rounded-md px-2 py-1.5 text-[11px] transition-opacity hover:opacity-80", priorityCard(task.priority))}><span className="block truncate font-medium">{task.title}</span><span className="block truncate opacity-70">{task.listName}</span></Link>)}{dayTasks.length > 2 ? <p className="px-1 text-[10px] text-paynes_gray-500">+{dayTasks.length - 2} more</p> : null}</div>
								</div>;
							})}
						</div>
						<div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-french_gray-200 px-4 py-3 text-xs text-paynes_gray-500 dark:border-paynes_gray-700"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-rose-500" /> High priority</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-500" /> Medium priority</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-emerald-500" /> Low priority</span></div>
					</div></div>
				</section>
			</div>

			<aside className="space-y-4">
				<section className="rounded-xl border border-french_gray-300 bg-white p-4 shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-500">
					<div className="flex items-center justify-between"><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Upcoming Deadlines</h2><Link href="/calendar" className="text-xs font-medium text-blue_munsell-600">View calendar</Link></div>
					<div className="mt-3 divide-y divide-french_gray-200 dark:divide-paynes_gray-700">{upcoming.map((task) => { const due = new Date(task.dueDate as string); return <Link key={task.id} href={`/projects/${task.projectId}`} className="flex items-center gap-3 py-3"><span className={cn("grid size-11 shrink-0 place-items-center rounded-lg text-center", priorityCard(task.priority))}><span><span className="block text-[9px] font-bold uppercase">{due.toLocaleString("en", { month: "short" })}</span><strong className="block text-sm">{due.getDate()}</strong></span></span><span className="min-w-0"><span className="block truncate text-sm font-medium">{task.title}</span><span className="block truncate text-xs text-paynes_gray-500">{task.projectName}</span></span></Link>; })}{upcoming.length === 0 ? <p className="py-7 text-center text-sm text-paynes_gray-500">No upcoming deadlines.</p> : null}</div>
				</section>
				<section className="rounded-xl border border-french_gray-300 bg-white p-4 shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-500">
					<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Today’s Agenda</h2><p className="mt-0.5 text-xs text-paynes_gray-500">{today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
					<div className="mt-3 space-y-1">{todayTasks.map((task) => <Link key={task.id} href={`/projects/${task.projectId}`} className="flex items-center gap-2 rounded-lg py-2 text-sm hover:bg-platinum-50 dark:hover:bg-outer_space-400"><span className={cn("size-2 shrink-0 rounded-full", priorityDot(task.priority))} /><span className="min-w-0 flex-1 truncate">{task.title}</span><span className="text-xs text-paynes_gray-500">Due today</span></Link>)}{todayTasks.length === 0 ? <p className="py-7 text-center text-sm text-paynes_gray-500">Nothing due today.</p> : null}</div>
				</section>
			</aside>
		</div>
	</div>;
}
