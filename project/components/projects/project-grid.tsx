import { FolderKanban } from "lucide-react";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { ProjectSummary } from "@/types";

export function ProjectGrid({
	projects,
	canCreate = true,
}: {
	projects: ProjectSummary[];
	canCreate?: boolean;
}) {
	if (projects.length === 0) {
		return (
			<EmptyState
				icon={<FolderKanban size={22} />}
				title="No projects found"
				description="Create a project or change the search term to see matching work."
				action={canCreate ? <CreateProjectButton /> : undefined}
			/>
		);
	}
	return (
		<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
			{projects.map((project) => (
				<ProjectCard key={project.id} project={project} />
			))}
		</div>
	);
}
