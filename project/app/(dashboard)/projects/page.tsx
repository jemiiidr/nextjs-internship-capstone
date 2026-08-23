import { Search } from "lucide-react";
import type { Metadata } from "next";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { ProjectGrid } from "@/components/projects/project-grid";
import { Input } from "@/components/ui/input";
import { requireWorkspaceContext } from "@/lib/auth";
import { getProjectsForUser } from "@/lib/db";

export const metadata: Metadata = {
	title: "Projects",
};

type ProjectsSearchParams = {
	q?: string | string[];
};

export default async function ProjectsPage({
	searchParams,
}: {
	searchParams: Promise<ProjectsSearchParams>;
}) {
	const context = await requireWorkspaceContext();
	const params = await searchParams;

	const q = Array.isArray(params.q) ? (params.q[0] ?? "") : (params.q ?? "");

	const projects = await getProjectsForUser({
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
		search: q,
	});

	return (
		<div className="space-y-6">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						Workspace boards
					</p>

					<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Projects
					</h1>

					<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">
						Plan work, assign collaborators, and move tasks through a visual
						workflow.
					</p>
				</div>

				{context.role !== "viewer" ? <CreateProjectButton /> : null}
			</header>

			<form className="relative max-w-xl">
				<Search
					className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paynes_gray-400"
					size={17}
				/>

				<Input
					name="q"
					defaultValue={q}
					placeholder="Search projects…"
					className="h-11 rounded-xl bg-white pl-10 dark:bg-outer_space-500"
				/>

				<button type="submit" className="sr-only">
					Search
				</button>
			</form>

			<ProjectGrid projects={projects} canCreate={context.role !== "viewer"} />
		</div>
	);
}
