"use client";

import { create } from "zustand";

interface UIState {
	isSidebarOpen: boolean;
	isSidebarCollapsed: boolean;
	isCreateProjectOpen: boolean;
	isCreateTaskOpen: boolean;
	isTaskDetailOpen: boolean;
	activeListId: string | null;
	activeTaskId: string | null;
	selectedTaskIds: string[];
	setSidebarOpen: (open: boolean) => void;
	toggleSidebar: () => void;
	toggleSidebarCollapsed: () => void;
	openCreateProject: () => void;
	closeCreateProject: () => void;
	openCreateTask: (listId: string) => void;
	closeCreateTask: () => void;
	openTaskDetail: (taskId: string) => void;
	closeTaskDetail: () => void;
	toggleTaskSelection: (taskId: string) => void;
	clearTaskSelection: () => void;
}

export const useUIStore = create<UIState>((set) => ({
	isSidebarOpen: false,
	isSidebarCollapsed: false,
	isCreateProjectOpen: false,
	isCreateTaskOpen: false,
	isTaskDetailOpen: false,
	activeListId: null,
	activeTaskId: null,
	selectedTaskIds: [],
	setSidebarOpen: (open) => set({ isSidebarOpen: open }),
	toggleSidebar: () =>
		set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
	toggleSidebarCollapsed: () =>
		set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
	openCreateProject: () => set({ isCreateProjectOpen: true }),
	closeCreateProject: () => set({ isCreateProjectOpen: false }),
	openCreateTask: (listId) =>
		set({ isCreateTaskOpen: true, activeListId: listId }),
	closeCreateTask: () => set({ isCreateTaskOpen: false, activeListId: null }),
	openTaskDetail: (taskId) =>
		set({ isTaskDetailOpen: true, activeTaskId: taskId }),
	closeTaskDetail: () => set({ isTaskDetailOpen: false, activeTaskId: null }),
	toggleTaskSelection: (taskId) =>
		set((state) => ({
			selectedTaskIds: state.selectedTaskIds.includes(taskId)
				? state.selectedTaskIds.filter((id) => id !== taskId)
				: [...state.selectedTaskIds, taskId],
		})),
	clearTaskSelection: () => set({ selectedTaskIds: [] }),
}));
