import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProjectGrid } from "@/components/projects/project-grid";
import { ProjectToolbar } from "@/components/projects/project-toolbar";
import { requireWorkspaceContext } from "@/lib/auth";
import { getProjectsForUser } from "@/lib/db";
import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import { getWorkspaceSummary } from "@/lib/workspaces";
import type { ProjectSummary } from "@/types";

export const metadata: Metadata = { title: "Projects" };
const PAGE_SIZE = 6;
type SortKey = "created" | "completion" | "name" | "deadline";

function completion(project: ProjectSummary) {
	return project.taskCount ? project.completedTaskCount / project.taskCount : 0;
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string | string[]; sort?: string; order?: string; page?: string }> }) {
	const context = await requireWorkspaceContext();
	const params = await searchParams;
	const q = Array.isArray(params.q) ? (params.q[0] ?? "") : (params.q ?? "");
	const sort: SortKey = ["created", "completion", "name", "deadline"].includes(params.sort ?? "") ? (params.sort as SortKey) : "created";
	const order = params.order === "desc" ? "desc" : "asc";
	const [projects, workspace] = await Promise.all([
		getProjectsForUser({ userId: context.user.id, workspaceId: context.workspaceId, role: context.role, search: q }),
		getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
	]);
	const direction = order === "asc" ? 1 : -1;
	const sorted = [...projects].sort((a, b) => {
		if (sort === "name") return a.name.localeCompare(b.name) * direction;
		if (sort === "completion") return (completion(a) - completion(b)) * direction;
		if (sort === "deadline") {
			if (!a.dueDate && !b.dueDate) return 0;
			if (!a.dueDate) return 1;
			if (!b.dueDate) return -1;
			return (new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()) * direction;
		}
		return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * direction;
	});
	const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
	const requestedPage = Number.parseInt(params.page ?? "1", 10);
	const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), pages);
	const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const pageHref = (nextPage: number) => {
		const query = new URLSearchParams({ sort, order, page: String(nextPage) });
		if (q) query.set("q", q);
		return `/projects?${query.toString()}`;
	};
	const canCreate = hasPermission(context.role, "project:create");

	return <div className="space-y-7">
		<header className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
			<div><h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">Projects</h1><p className="mt-1 text-paynes_gray-500 dark:text-french_gray-400">Plan, track, and deliver work across {workspace.name}.</p></div>
			<ProjectToolbar query={q} sort={sort} order={order} canCreate={canCreate} />
		</header>
		<ProjectGrid projects={visible} canCreate={canCreate} />
		{sorted.length > 0 ? <footer className="flex flex-col items-center justify-between gap-3 text-sm text-paynes_gray-500 sm:flex-row"><span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} projects</span>{pages > 1 ? <div className="flex items-center gap-1"><Link aria-label="Previous page" href={pageHref(Math.max(1, page - 1))} className={cn("grid size-8 place-items-center rounded-lg hover:bg-platinum-100 dark:hover:bg-outer_space-400", page === 1 && "pointer-events-none opacity-30")}><ChevronLeft size={16} /></Link>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <Link key={number} href={pageHref(number)} className={cn("grid size-8 place-items-center rounded-lg text-xs", page === number ? "bg-blue_munsell-500 font-semibold text-white" : "hover:bg-platinum-100 dark:hover:bg-outer_space-400")}>{number}</Link>)}<Link aria-label="Next page" href={pageHref(Math.min(pages, page + 1))} className={cn("grid size-8 place-items-center rounded-lg hover:bg-platinum-100 dark:hover:bg-outer_space-400", page === pages && "pointer-events-none opacity-30")}><ChevronRight size={16} /></Link></div> : null}</footer> : null}
	</div>;
}
