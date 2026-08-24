import { Activity, AlertCircle, CalendarDays, CheckCircle2, Clock3, FolderKanban, ListTodo, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { AnalyticsData, MyTaskItem, ProjectSummary, UserSummary } from "@/types";

interface DashboardActivity {
	id: string; action: string; metadata: Record<string, string | number | boolean | null>;
	createdAt: string; actor: UserSummary; projectId: string; projectName: string;
}
interface Deadline { id: string; title: string; priority: string; dueDate: string | null; projectId: string; projectName: string; listName: string }

const panelClass = "min-h-[22rem] h-full overflow-hidden";
const statusColors = ["#7467f0", "#f29586", "#f3ad3d", "#62ccb1", "#58a8ed", "#db70b0"];

function EmptyRecords({ label }: { label: string }) {
	return <div className="grid min-h-56 place-items-center rounded-xl border border-dashed border-french_gray-300 p-6 text-center dark:border-paynes_gray-700"><div><ListTodo className="mx-auto text-paynes_gray-300" size={28} /><p className="mt-3 text-sm font-medium text-paynes_gray-500">No {label} records yet.</p><p className="mt-1 text-xs text-paynes_gray-400">New records will appear here automatically.</p></div></div>;
}

function PanelHeader({ title, href, link = "View all" }: { title: string; href?: string; link?: string }) {
	return <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">{title}</h2>{href ? <Link href={href} className="text-xs font-semibold text-blue_munsell-600 hover:text-blue_munsell-700 dark:text-blue_munsell-300">{link}</Link> : null}</div>;
}

function activityCopy(item: DashboardActivity) {
	const subject = String(item.metadata.taskTitle ?? item.metadata.projectName ?? item.metadata.listName ?? item.metadata.memberName ?? "workspace item");
	const verbs: Record<string, string> = { project_created: "created", project_updated: "updated", project_member_added: "added a member to", project_member_removed: "removed a member from", list_created: "created", list_updated: "updated", list_deleted: "deleted", task_created: "created", task_updated: "updated", task_moved: "moved", task_deleted: "deleted", comment_created: "commented on" };
	return `${verbs[item.action] ?? "updated"} ${subject}`;
}

function CompletionChart({ points }: { points: AnalyticsData["completedByDay"] }) {
	if (!points.length || points.every((point) => point.completed === 0 && point.created === 0)) return <EmptyRecords label="completion" />;
	let total = 0;
	const values = points.map((point) => (total += point.completed));
	const maximum = Math.max(...values, 1);
	const polyline = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${92 - (value / maximum) * 72}`).join(" ");
	return <div><div className="mb-3 flex items-end gap-2"><strong className="text-3xl text-outer_space-900 dark:text-platinum-50">{total}</strong><span className="pb-1 text-xs text-emerald-600">completed in 14 days</span></div><svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-40 w-full" role="img" aria-label={`${total} tasks completed over 14 days`}><defs><linearGradient id="completion-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--brand-color)" stopOpacity=".28"/><stop offset="1" stopColor="var(--brand-color)" stopOpacity="0"/></linearGradient></defs><path d={`M ${polyline} L 100,100 L 0,100 Z`} fill="url(#completion-fill)"/><polyline points={polyline} fill="none" stroke="var(--brand-color)" strokeWidth="2" vectorEffect="non-scaling-stroke"/></svg><div className="flex justify-between text-[10px] text-paynes_gray-400"><span>{points[0]?.date.slice(5)}</span><span>{points[Math.floor(points.length / 2)]?.date.slice(5)}</span><span>{points.at(-1)?.date.slice(5)}</span></div></div>;
}

export function DashboardOverview({ stats, analytics, tasks, projects, activities, deadlines }: {
	stats: { projectCount: number; totalTasks: number; completedTasks: number; dueSoon: number };
	analytics: AnalyticsData; tasks: MyTaskItem[]; projects: ProjectSummary[]; activities: DashboardActivity[]; deadlines: Deadline[];
}) {
	const statItems = [
		{ label: "Active", value: analytics.inProgressTasks, icon: TrendingUp, tone: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-300" },
		{ label: "Due soon", value: stats.dueSoon, icon: Clock3, tone: "bg-rose-100 text-rose-500 dark:bg-rose-950/50 dark:text-rose-300" },
		{ label: "Completion", value: `${analytics.completionRate}%`, icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300" },
		{ label: "Overdue", value: analytics.overdueTasks, icon: AlertCircle, tone: "bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-300" },
	];
	const statusTotal = analytics.status.reduce((sum, item) => sum + item.count, 0);
	let angle = 0;
	const gradient = analytics.status.map((item, index) => { const start = angle; angle += statusTotal ? (item.count / statusTotal) * 360 : 0; return `${statusColors[index % statusColors.length]} ${start}deg ${angle}deg`; }).join(", ");

	return <div className="space-y-5">
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{statItems.map((item) => <Card key={item.label} className="min-h-32"><CardContent className="flex h-full items-center gap-5 p-5"><span className={cn("grid size-14 shrink-0 place-items-center rounded-full", item.tone)}><item.icon size={25}/></span><div><p className="text-sm font-medium text-paynes_gray-500">{item.label}</p><p className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">{item.value}</p></div></CardContent></Card>)}</div>

		<div className="grid items-stretch gap-4 xl:grid-cols-3">
			<Card className={panelClass}><CardContent className="p-5"><PanelHeader title="My Tasks" href="/my-tasks" />{tasks.length ? <div className="divide-y divide-french_gray-200 dark:divide-paynes_gray-800">{tasks.slice(0, 5).map((task) => <Link key={task.id} href={`/projects/${task.projectId}`} className="flex items-center gap-3 py-3"><span className="size-4 rounded-full border border-paynes_gray-300"/><span className={cn("size-2 rounded-full", task.priority === "high" ? "bg-rose-500" : task.priority === "medium" ? "bg-amber-400" : "bg-emerald-400")}/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{task.title}</span><span className="block truncate text-xs text-paynes_gray-500">{task.projectName}</span></span><span className="rounded-lg bg-blue_munsell-50 px-2 py-1 text-[10px] font-medium text-blue_munsell-600 dark:bg-blue_munsell-900/30 dark:text-blue_munsell-300">{task.listName}</span></Link>)}</div> : <EmptyRecords label="assigned task" />}</CardContent></Card>

			<Card className={panelClass}><CardContent className="p-5"><PanelHeader title="Recent Activity" />{activities.length ? <div className="divide-y divide-french_gray-200 dark:divide-paynes_gray-800">{activities.slice(0, 5).map((item) => <Link key={item.id} href={`/projects/${item.projectId}`} className="flex gap-3 py-3"><Avatar name={item.actor.name} src={item.actor.avatarUrl} className="size-9"/><span className="min-w-0 flex-1"><span className="block text-sm"><strong>{item.actor.name}</strong> {activityCopy(item)}</span><span className="mt-0.5 block truncate text-xs text-paynes_gray-500">{item.projectName} · {formatRelativeDate(item.createdAt)}</span></span><Activity size={15} className="mt-1 shrink-0 text-blue_munsell-500"/></Link>)}</div> : <EmptyRecords label="activity" />}</CardContent></Card>

			<Card className={panelClass}><CardContent className="p-5"><PanelHeader title="Projects" href="/projects" />{projects.length ? <div className="space-y-4">{projects.slice(0, 5).map((project, index) => { const progress = project.taskCount ? Math.round((project.completedTaskCount / project.taskCount) * 100) : 0; return <Link key={project.id} href={`/projects/${project.id}`} className="grid grid-cols-[2.5rem_minmax(0,1fr)_7rem_2.5rem] items-center gap-3"><span className="grid size-10 place-items-center rounded-xl text-white" style={{ background: statusColors[index % statusColors.length] }}><FolderKanban size={17}/></span><span className="min-w-0"><span className="block truncate text-sm font-medium">{project.name}</span><span className="text-xs text-paynes_gray-500">{project.taskCount} tasks</span></span><span className="h-1.5 overflow-hidden rounded-full bg-platinum-300 dark:bg-outer_space-300"><span className="block h-full rounded-full bg-blue_munsell-500" style={{ width: `${progress}%` }}/></span><span className="text-right text-xs font-medium">{progress}%</span></Link>; })}</div> : <EmptyRecords label="project" />}</CardContent></Card>
		</div>

		<div className="grid items-stretch gap-4 xl:grid-cols-3">
			<Card className={panelClass}><CardContent className="p-5"><PanelHeader title="Tasks by Status" />{analytics.status.length ? <div className="grid min-h-64 place-items-center gap-6 sm:grid-cols-2 xl:grid-cols-[11rem_1fr]"><div className="relative size-40 rounded-full" style={{ background: `conic-gradient(${gradient})` }}><span className="absolute inset-8 grid place-items-center rounded-full bg-white text-center dark:bg-outer_space-500"><span><strong className="block text-2xl">{statusTotal}</strong><small className="text-paynes_gray-500">tasks</small></span></span></div><div className="w-full space-y-3">{analytics.status.slice(0, 6).map((item, index) => <div key={item.label} className="flex items-center gap-2 text-xs"><span className="size-2.5 rounded-full" style={{ background: statusColors[index % statusColors.length] }}/><span className="min-w-0 flex-1 truncate">{item.label}</span><strong>{statusTotal ? Math.round((item.count / statusTotal) * 100) : 0}%</strong><span className="text-paynes_gray-400">({item.count})</span></div>)}</div></div> : <EmptyRecords label="task status" />}</CardContent></Card>

			<Card className={panelClass}><CardContent className="p-5"><PanelHeader title="Tasks Completed" /><CompletionChart points={analytics.completedByDay}/></CardContent></Card>

			<Card className={panelClass}><CardContent className="p-5"><PanelHeader title="Upcoming Deadlines" href="/calendar" link="View calendar" />{deadlines.length ? <div className="divide-y divide-french_gray-200 dark:divide-paynes_gray-800">{deadlines.slice(0, 4).map((task) => { const date = new Date(task.dueDate as string); return <Link key={task.id} href={`/projects/${task.projectId}`} className="flex items-center gap-3 py-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-center dark:bg-rose-950/30"><span className="text-[9px] font-bold uppercase text-rose-500">{date.toLocaleString("en", { month: "short" })}</span><strong className="-mt-1 block text-sm text-outer_space-900 dark:text-platinum-50">{date.getDate()}</strong></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{task.title}</span><span className="block truncate text-xs text-paynes_gray-500">{task.projectName}</span></span><CalendarDays size={16} className="text-paynes_gray-400"/></Link>; })}</div> : <EmptyRecords label="upcoming deadline" />}</CardContent></Card>
		</div>
	</div>;
}
