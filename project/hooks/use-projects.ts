"use client";

import { useCallback, useOptimistic, useState, useTransition } from "react";
import {
	createProjectAction,
	deleteProjectAction,
} from "@/app/actions/projects";
import type { ProjectSummary } from "@/types";

export function useProjects(initialProjects: ProjectSummary[]) {
	const [projects, setProjects] = useState(initialProjects);
	const [isPending, startTransition] = useTransition();

	const [optimisticProjects, addOptimisticProject] = useOptimistic(
		projects,
		(state, project: ProjectSummary) => [project, ...state],
	);

	const createProject = useCallback(
		(formData: FormData, onComplete?: (message: string) => void) => {
			const optimistic: ProjectSummary = {
				id: `optimistic-${crypto.randomUUID()}`,
				name: String(formData.get("name") || "New project"),
				description: String(formData.get("description") || "") || null,
				dueDate: String(formData.get("dueDate") || "") || null,
				visibility:
					formData.get("visibility") === "workspace" ? "workspace" : "private",
				role: "owner",
				memberCount: 1,
				taskCount: 0,
				completedTaskCount: 0,
				updatedAt: new Date().toISOString(),
			};

			startTransition(async () => {
				addOptimisticProject(optimistic);

				const result = await createProjectAction(formData);

				if (result.success && result.data) {
					setProjects((state) => [result.data as ProjectSummary, ...state]);
				}

				onComplete?.(result.message);
			});
		},
		[addOptimisticProject],
	);

	const removeProject = useCallback(
		(projectId: string, onComplete?: (message: string) => void) => {
			startTransition(async () => {
				const result = await deleteProjectAction(projectId);

				if (result.success) {
					setProjects((state) =>
						state.filter((project) => project.id !== projectId),
					);
				}

				onComplete?.(result.message);
			});
		},
		[],
	);

	return {
		projects: optimisticProjects,
		createProject,
		removeProject,
		isPending,
	};
}
