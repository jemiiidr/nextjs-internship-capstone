"use client";

import { create } from "zustand";
import type {
	BoardList,
	BoardTask,
	ProjectBoardData,
	ProjectMember,
} from "@/types";

interface BoardState {
	project: ProjectBoardData["project"] | null;
	lists: BoardList[];
	tasks: BoardTask[];
	members: ProjectMember[];
	search: string;
	priorityFilter: "all" | BoardTask["priority"];
	hydrate: (data: ProjectBoardData) => void;
	setSearch: (search: string) => void;
	setPriorityFilter: (priority: BoardState["priorityFilter"]) => void;
	addTask: (task: BoardTask) => void;
	updateTask: (task: BoardTask) => void;
	removeTask: (taskId: string) => void;
	removeTasks: (taskIds: string[]) => void;
	replaceTasks: (tasks: BoardTask[]) => void;
	addList: (list: BoardList) => void;
	updateListName: (listId: string, name: string) => void;
	removeList: (listId: string) => void;
	moveTaskLocally: (taskId: string, toListId: string, position: number) => void;
}

function normalizePositions(tasks: BoardTask[], listId: string) {
	return tasks
		.filter((task) => task.listId === listId)
		.sort((a, b) => a.position - b.position)
		.map((task, position) => ({ ...task, position }));
}

export const useBoardStore = create<BoardState>((set) => ({
	project: null,
	lists: [],
	tasks: [],
	members: [],
	search: "",
	priorityFilter: "all",
	hydrate: (data) =>
		set({
			project: data.project,
			lists: data.lists,
			tasks: data.tasks,
			members: data.members,
		}),
	setSearch: (search) => set({ search }),
	setPriorityFilter: (priorityFilter) => set({ priorityFilter }),
	addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
	updateTask: (task) =>
		set((state) => ({
			tasks: state.tasks.map((candidate) =>
				candidate.id === task.id ? task : candidate,
			),
		})),
	removeTask: (taskId) =>
		set((state) => ({
			tasks: state.tasks.filter((task) => task.id !== taskId),
		})),
	removeTasks: (taskIds) => {
		const ids = new Set(taskIds);
		set((state) => ({
			tasks: state.tasks.filter((task) => !ids.has(task.id)),
		}));
	},
	replaceTasks: (tasks) => set({ tasks }),
	addList: (list) =>
		set((state) => ({
			lists: [...state.lists, list].sort((a, b) => a.position - b.position),
		})),
	updateListName: (listId, name) =>
		set((state) => ({
			lists: state.lists.map((list) =>
				list.id === listId ? { ...list, name } : list,
			),
		})),
	removeList: (listId) =>
		set((state) => ({
			lists: state.lists.filter((list) => list.id !== listId),
			tasks: state.tasks.filter((task) => task.listId !== listId),
		})),
	moveTaskLocally: (taskId, toListId, position) =>
		set((state) => {
			const moving = state.tasks.find((task) => task.id === taskId);
			if (!moving) return state;
			const affectedListIds = new Set([moving.listId, toListId]);
			const remaining = state.tasks.filter((task) => task.id !== taskId);
			const destination = remaining
				.filter((task) => task.listId === toListId)
				.sort((a, b) => a.position - b.position);
			destination.splice(Math.min(position, destination.length), 0, {
				...moving,
				listId: toListId,
			});

			const unaffected = remaining.filter(
				(task) => !affectedListIds.has(task.listId),
			);
			const target = destination.map((task, nextPosition) => ({
				...task,
				position: nextPosition,
			}));
			if (moving.listId === toListId)
				return { tasks: [...unaffected, ...target] };
			const source = normalizePositions(remaining, moving.listId);
			return { tasks: [...unaffected, ...source, ...target] };
		}),
}));
