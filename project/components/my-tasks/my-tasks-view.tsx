"use client";

import { Activity, CalendarDays, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Filter, LayoutGrid, List, Search, UsersRound } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, decodeLabel, formatDate } from "@/lib/utils";
import type { MyTaskItem, UserSummary } from "@/types";

const PAGE_SIZE = 14;

function isDone(status: string) { return /done|complete/i.test(status); }
function isProgress(status: string) { return /progress/i.test(status); }
function dayStart(value = new Date()) { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; }

function SummaryCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof UsersRound; tone: "violet" | "rose" | "blue" | "emerald" }) {
	const tones = {
		violet: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
		rose: "bg-rose-100 text-rose-500 dark:bg-rose-950/60 dark:text-rose-300",
		blue: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
		emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300",
	};
	return <div className="flex min-h-32 items-center gap-5 rounded-xl border border-french_gray-300 bg-white p-5 shadow-sm dark:border-paynes_gray-400 dark:bg-outer_space-500">
		<div className={cn("grid size-16 shrink-0 place-items-center rounded-full", tones[tone])}><Icon size={31} /></div>
		<div><p className="text-sm font-medium text-paynes_gray-500 dark:text-french_gray-400">{label}</p><p className="mt-1 text-3xl font-semibold text-outer_space-500 dark:text-platinum-500">{value}</p><p className="mt-1 text-xs text-paynes_gray-400">Current workspace</p></div>
	</div>;
}

function priorityClass(priority: MyTaskItem["priority"]) {
	return priority === "high" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300" : priority === "medium" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300";
}

function statusClass(status: string) {
	if (isDone(status)) return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300";
	if (/review|block/i.test(status)) return "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-300";
	if (isProgress(status)) return "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300";
	return "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-300";
}

export function MyTasksView({ tasks, user }: { tasks: MyTaskItem[]; user: UserSummary }) {
	const [query, setQuery] = useState("");
	const [view, setView] = useState<"list" | "board">("list");
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [priority, setPriority] = useState<"all" | MyTaskItem["priority"]>("all");
	const [page, setPage] = useState(1);
	const today = dayStart();
	const filtered = useMemo(() => tasks.filter((task) => {
		if (priority !== "all" && task.priority !== priority) return false;
		const text = `${task.title} ${task.projectName} ${task.listName} ${task.labels.join(" ")}`.toLowerCase();
		return text.includes(query.trim().toLowerCase());
	}), [tasks, priority, query]);
	const completed = tasks.filter((task) => isDone(task.listName));
	const dueToday = tasks.filter((task) => task.dueDate && dayStart(new Date(task.dueDate)).getTime() === today.getTime() && !isDone(task.listName));
	const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const groups = [
		{ name: "Today", color: "text-rose-500", tasks: visible.filter((task) => task.dueDate && dayStart(new Date(task.dueDate)).getTime() === today.getTime() && !isDone(task.listName)) },
		{ name: "Upcoming", color: "text-violet-600", tasks: visible.filter((task) => (!task.dueDate || dayStart(new Date(task.dueDate)).getTime() !== today.getTime()) && !isDone(task.listName)) },
		{ name: "Completed", color: "text-emerald-600", tasks: visible.filter((task) => isDone(task.listName)) },
	].filter((group) => group.tasks.length);

	return <div className="space-y-6">
		<header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
			<div><h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">My Tasks</h1><p className="mt-1 text-paynes_gray-500 dark:text-french_gray-400">Stay on top of your work and deadlines.</p></div>
			<div className="flex flex-wrap items-center gap-2">
				<div className="relative min-w-56 flex-1"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-paynes_gray-400" /><Input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search tasks..." className="pl-9" /></div>
				<div className="relative"><Button variant="secondary" onClick={() => setFiltersOpen((open) => !open)}><Filter size={16} /> Filters <ChevronDown size={14} className={cn("transition-transform", filtersOpen && "rotate-180")} /></Button>{filtersOpen ? <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-french_gray-300 bg-white p-2 shadow-xl dark:border-paynes_gray-400 dark:bg-outer_space-400">{(["all", "low", "medium", "high"] as const).map((item) => <button type="button" key={item} onClick={() => { setPriority(item); setFiltersOpen(false); setPage(1); }} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm capitalize hover:bg-platinum-100 dark:hover:bg-outer_space-300", priority === item && "text-blue_munsell-600")}>{item === "all" ? "All priorities" : item}</button>)}</div> : null}</div>
				<fieldset className="flex rounded-lg border border-french_gray-300 p-1 dark:border-paynes_gray-400"><legend className="sr-only">Task view</legend><Button size="sm" variant={view === "list" ? "default" : "ghost"} onClick={() => setView("list")}><List size={15} /> List</Button><Button size="sm" variant={view === "board" ? "default" : "ghost"} onClick={() => setView("board")}><LayoutGrid size={15} /> Board</Button></fieldset>
			</div>
		</header>

		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><SummaryCard label="Assigned" value={tasks.length} icon={UsersRound} tone="violet" /><SummaryCard label="Due Today" value={dueToday.length} icon={CalendarDays} tone="rose" /><SummaryCard label="In Progress" value={tasks.filter((task) => isProgress(task.listName)).length} icon={Activity} tone="blue" /><SummaryCard label="Completed" value={completed.length} icon={CheckCircle2} tone="emerald" /></div>

		{view === "list" ? <div className="min-h-[32rem] overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<div className="hidden grid-cols-[minmax(18rem,2fr)_1fr_0.65fr_0.75fr_0.7fr_0.55fr] gap-4 border-b border-french_gray-300 px-4 py-3 text-xs font-semibold text-paynes_gray-500 dark:border-paynes_gray-400 md:grid"><span>Task</span><span>Project</span><span>Priority</span><span>Status</span><span>Due Date</span><span>Assignee</span></div>
			{groups.length ? groups.map((group) => <section key={group.name}><div className={cn("flex items-center gap-2 border-b border-french_gray-200 px-4 py-3 text-sm font-semibold dark:border-paynes_gray-400", group.color)}><ChevronDown size={15} />{group.name}<span className="text-paynes_gray-400">{group.tasks.length}</span></div>{group.tasks.map((task) => <Link href={`/projects/${task.projectId}`} key={task.id} className="grid gap-3 border-b border-french_gray-200 px-4 py-3.5 transition-colors hover:bg-platinum-50 dark:border-paynes_gray-400 dark:hover:bg-outer_space-400 md:grid-cols-[minmax(18rem,2fr)_1fr_0.65fr_0.75fr_0.7fr_0.55fr] md:items-center md:gap-4"><div className="flex min-w-0 items-center gap-3"><span className={cn("size-2 shrink-0 rounded-full", isDone(task.listName) ? "bg-emerald-400" : task.priority === "high" ? "bg-rose-400" : task.priority === "medium" ? "bg-amber-400" : "bg-blue-400")} /><div className="min-w-0"><p className={cn("truncate text-sm font-medium text-outer_space-500 dark:text-platinum-500", isDone(task.listName) && "text-paynes_gray-400 line-through")}>{task.title}</p>{task.labels.length ? <div className="mt-1 flex gap-1">{task.labels.slice(0, 2).map((label) => { const decoded = decodeLabel(label); return <Badge key={label} style={{ color: decoded.color, borderColor: `${decoded.color}55`, backgroundColor: `${decoded.color}18` }}>{decoded.name}</Badge>; })}</div> : null}</div></div><span className="truncate text-sm text-paynes_gray-500">{task.projectName}</span><span className={cn("w-fit rounded-md px-3 py-1 text-xs font-medium capitalize", priorityClass(task.priority))}>{task.priority}</span><span className={cn("w-fit rounded-md px-3 py-1 text-xs font-medium", statusClass(task.listName))}>{task.listName}</span><span className={cn("text-sm text-paynes_gray-500", task.dueDate && dayStart(new Date(task.dueDate)).getTime() === today.getTime() && "font-medium text-rose-500")}>{task.dueDate ? formatDate(task.dueDate, { year: undefined }) : "No date"}</span><Avatar name={user.name} src={user.avatarUrl} className="size-7" /></Link>)}</section>) : <div className="grid min-h-[28rem] place-items-center text-sm text-paynes_gray-500">No tasks match your filters.</div>}
			<div className="flex items-center justify-between px-4 py-3 text-xs text-paynes_gray-500"><span>Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} tasks</span><div className="flex items-center gap-1"><Button size="icon" variant="secondary" className="size-8" disabled={page === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={15} /></Button><span className="grid size-8 place-items-center rounded-md border border-blue_munsell-400 text-blue_munsell-600">{page}</span><Button size="icon" variant="secondary" className="size-8" disabled={page === pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={15} /></Button></div></div>
		</div> : <div className="grid min-h-[32rem] gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map((group) => <section key={group.name} className="rounded-xl border border-french_gray-300 bg-platinum-50/60 p-3 dark:border-paynes_gray-400 dark:bg-outer_space-500"><h2 className={cn("mb-3 flex items-center gap-2 font-semibold", group.color)}>{group.name}<span className="text-xs text-paynes_gray-400">{group.tasks.length}</span></h2><div className="space-y-2">{group.tasks.map((task) => <Link href={`/projects/${task.projectId}`} key={task.id} className="block rounded-xl border border-french_gray-300 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-paynes_gray-400 dark:bg-outer_space-400"><p className="font-medium text-outer_space-500 dark:text-platinum-500">{task.title}</p><p className="mt-1 text-xs text-paynes_gray-500">{task.projectName}</p><div className="mt-3 flex items-center justify-between"><span className={cn("rounded-md px-2 py-1 text-xs capitalize", priorityClass(task.priority))}>{task.priority}</span><span className="text-xs text-paynes_gray-500">{task.dueDate ? formatDate(task.dueDate, { year: undefined }) : "No date"}</span></div></Link>)}</div></section>)}</div>}
	</div>;
}
