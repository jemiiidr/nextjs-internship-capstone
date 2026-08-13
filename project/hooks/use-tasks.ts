"use client";

import { useMemo } from "react";
import { useBoardStore } from "@/stores/board-store";

export function useTasks(listId?: string) {
	const tasks = useBoardStore((state) => state.tasks);
	const search = useBoardStore((state) => state.search);
	const priorityFilter = useBoardStore((state) => state.priorityFilter);

	return useMemo(() => {
		const normalizedSearch = search.trim().toLowerCase();
		return tasks
			.filter((task) => !listId || task.listId === listId)
			.filter(
				(task) => priorityFilter === "all" || task.priority === priorityFilter,
			)
			.filter((task) => {
				if (!normalizedSearch) return true;
				return [task.title, task.description ?? "", ...task.labels]
					.join(" ")
					.toLowerCase()
					.includes(normalizedSearch);
			})
			.sort((a, b) => a.position - b.position);
	}, [listId, priorityFilter, search, tasks]);
}
