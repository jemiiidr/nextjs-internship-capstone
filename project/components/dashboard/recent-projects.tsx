import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProjectGrid } from "@/components/projects/project-grid";
import type { ProjectSummary } from "@/types";

export function RecentProjects({ projects }: { projects: ProjectSummary[] }) {
	return (
		<section className="space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-outer_space-900 dark:text-platinum-50">
						Recent projects
					</h2>
					<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
						Your most recently updated workspaces.
					</p>
				</div>
				<Link
					href="/projects"
					className="flex items-center gap-1 text-sm font-medium text-blue_munsell-600 hover:text-blue_munsell-700 dark:text-blue_munsell-300"
				>
					View all <ArrowRight size={15} />
				</Link>
			</div>
			<ProjectGrid projects={projects} />
		</section>
	);
}
