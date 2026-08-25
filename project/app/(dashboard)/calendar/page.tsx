import { ChevronDown, ChevronLeft, ChevronRight, Plus, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDayTasks } from "@/components/calendar/calendar-day-tasks";
import { CalendarMonthPicker } from "@/components/calendar/calendar-month-picker";
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
function parseDate(value: string | undefined, fallback: Date) {
	if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
	const date = new Date(`${value}T00:00:00`);
	return Number.isNaN(date.getTime()) ? fallback : date;
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

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; view?: string; date?: string }> }) {
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
	const isDayView = params.view === "day";
	const weekFallback = year === today.getFullYear() && month === today.getMonth() ? today : firstDay;
	const weekAnchor = parseDate(params.date, weekFallback);
	const weekStart = new Date(weekAnchor);
	weekStart.setDate(weekAnchor.getDate() - weekAnchor.getDay());
	const weekDays = Array.from({ length: 7 }, (_, index) => {
		const date = new Date(weekStart);
		date.setDate(weekStart.getDate() + index);
		return date;
	});
	const previousDay = new Date(weekAnchor);
	previousDay.setDate(weekAnchor.getDate() - 7);
	const nextDay = new Date(weekAnchor);
	nextDay.setDate(weekAnchor.getDate() + 7);
	const weekDateKey = (date: Date) => dateKey(date.getFullYear(), date.getMonth(), date.getDate());
	const pickerYear = isDayView ? weekAnchor.getFullYear() : year;
	const pickerMonth = isDayView ? weekAnchor.getMonth() : month;
	const previousHref = isDayView ? `/calendar?view=day&date=${weekDateKey(previousDay)}` : `/calendar?month=${monthKey(previousMonth.year, previousMonth.month)}`;
	const nextHref = isDayView ? `/calendar?view=day&date=${weekDateKey(nextDay)}` : `/calendar?month=${monthKey(nextMonth.year, nextMonth.month)}`;
	const todayHref = isDayView ? `/calendar?view=day&date=${todayKey}` : `/calendar?month=${monthKey(today.getFullYear(), today.getMonth())}`;
	const selectedDayKey = weekDateKey(weekAnchor);
	const selectedDayTasks = taskGroups.get(selectedDayKey) ?? [];
	const dayHours = Array.from({ length: 13 }, (_, index) => index + 8);
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
						<div className="flex"><Link href={previousHref}><Button variant="secondary" size="icon" className="rounded-r-md" aria-label={isDayView ? "Previous week" : "Previous month"}><ChevronLeft size={17} /></Button></Link><Link href={nextHref}><Button variant="secondary" size="icon" className="-ml-px rounded-l-md" aria-label={isDayView ? "Next week" : "Next month"}><ChevronRight size={17} /></Button></Link></div>
						<CalendarMonthPicker year={pickerYear} month={pickerMonth} />
						<Link href={todayHref}><Button variant="secondary">Today</Button></Link>
					</div>
					<div className="grid grid-cols-2 rounded-xl border border-french_gray-300 bg-white p-1 dark:border-paynes_gray-700 dark:bg-outer_space-400"><Link href={`/calendar?month=${monthKey(pickerYear, pickerMonth)}`} className={cn("rounded-lg px-5 py-2 text-center text-sm font-medium", !isDayView ? "bg-blue_munsell-500 text-white" : "text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300")}>Month</Link><Link href={`/calendar?view=day&date=${weekDateKey(weekAnchor)}`} className={cn("rounded-lg px-5 py-2 text-center text-sm font-medium", isDayView ? "bg-blue_munsell-500 text-white" : "text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300")}>Day</Link></div>
				</div>

				<section className="overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-700 dark:bg-outer_space-500">
					<div className="overflow-x-auto"><div className="min-w-190">
						{isDayView ? (
							<div>
								<div className="grid grid-cols-7 border-b border-french_gray-200 px-4 py-3 dark:border-paynes_gray-700">{weekDays.map((date) => { const key = weekDateKey(date); const selected = key === selectedDayKey; return <Link key={key} href={`/calendar?view=day&date=${key}`} className="group flex flex-col items-center gap-1 rounded-xl py-2 transition-colors hover:bg-platinum-100 dark:hover:bg-outer_space-400"><span className={cn("text-xs font-semibold uppercase tracking-wide", selected ? "text-blue_munsell-600 dark:text-blue_munsell-300" : "text-paynes_gray-500")}>{WEEKDAYS[date.getDay()]}</span><span className={cn("grid size-9 place-items-center rounded-full text-sm font-semibold transition-colors", selected ? "bg-blue_munsell-500 text-white shadow-sm" : key === todayKey ? "ring-2 ring-blue_munsell-300 text-blue_munsell-600" : "text-outer_space-900 group-hover:bg-white dark:text-platinum-50 dark:group-hover:bg-outer_space-300")}>{date.getDate()}</span></Link>; })}</div>
								<div className="border-b border-french_gray-200 px-5 py-4 dark:border-paynes_gray-700"><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">{weekAnchor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2><p className="mt-1 text-xs text-paynes_gray-500">Daily schedule and task deadlines</p></div>
								<div className="grid grid-cols-[5rem_1fr] border-b border-french_gray-200 dark:border-paynes_gray-700"><div className="px-3 py-4 text-right text-xs font-medium text-paynes_gray-400">All day</div><div className="min-h-20 border-l border-french_gray-200 p-3 dark:border-paynes_gray-700">{selectedDayTasks.length ? <CalendarDayTasks tasks={selectedDayTasks} date={selectedDayKey} maxVisible={8} /> : <p className="py-3 text-sm text-paynes_gray-400">No deadlines for this day.</p>}</div></div>
								<div>{dayHours.map((hour) => <div key={hour} className="grid grid-cols-[5rem_1fr]"><div className="-translate-y-2 px-3 text-right text-xs text-paynes_gray-400">{hour === 12 ? "12 PM" : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}</div><div className="h-16 border-l border-t border-french_gray-200 dark:border-paynes_gray-700" /></div>)}</div>
							</div>
						) : (
							<><div className="grid grid-cols-7">{WEEKDAYS.map((day) => <div key={day} className="px-3 py-3 text-center text-xs font-semibold text-paynes_gray-500">{day}</div>)}</div><div className="grid grid-cols-7 border-l border-t border-french_gray-200 dark:border-paynes_gray-700">{calendarDays.map((calendarDay) => { const key = dateKey(calendarDay.year, calendarDay.month, calendarDay.day); const dayTasks = taskGroups.get(key) ?? []; const isToday = key === todayKey; return <div key={key} className={cn("min-h-28 border-b border-r border-french_gray-200 p-2 dark:border-paynes_gray-700", calendarDay.isCurrentMonth ? "bg-white dark:bg-outer_space-500" : "bg-platinum-50/60 dark:bg-outer_space-600/40")}><span className={cn("grid size-7 place-items-center rounded-full text-sm", !calendarDay.isCurrentMonth && "text-french_gray-400", isToday && "bg-blue_munsell-500 font-semibold text-white")}>{calendarDay.day}</span><CalendarDayTasks tasks={dayTasks} date={key} /></div>; })}</div></>
						)}
						<div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-french_gray-200 px-4 py-3 text-xs text-paynes_gray-500 dark:border-paynes_gray-700"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-rose-500" /> High priority</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-amber-500" /> Medium priority</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-emerald-500" /> Low priority</span></div>
					</div></div>
				</section>
			</div>

			<aside className="space-y-4">
				<section className="rounded-xl border border-french_gray-300 bg-white p-4 shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-500">
					<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Upcoming Deadlines</h2>
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
