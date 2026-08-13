"use client";

import {
	closestCorners,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useDroppable,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Filter, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import {
	createListAction,
	deleteListAction,
	updateListAction,
} from "@/app/actions/lists";
import { bulkDeleteTasksAction, moveTaskAction } from "@/app/actions/tasks";
import {
	CreateTaskModal,
	TaskDetailModal,
} from "@/components/modals/create-task-modal";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import type { BoardList, BoardTask, ProjectBoardData } from "@/types";

interface OptimisticMove {
	taskId: string;
	toListId: string;
	position: number;
}

function moveInArray(tasks: BoardTask[], move: OptimisticMove) {
	const moving = tasks.find((task) => task.id === move.taskId);
	if (!moving) return tasks;
	const unaffected = tasks.filter((task) => task.id !== move.taskId);
	const destination = unaffected
		.filter((task) => task.listId === move.toListId)
		.sort((a, b) => a.position - b.position);
	destination.splice(Math.min(move.position, destination.length), 0, {
		...moving,
		listId: move.toListId,
	});
	const affected = new Set([moving.listId, move.toListId]);
	const result = unaffected.filter((task) => !affected.has(task.listId));
	for (const listId of affected) {
		const ordered =
			listId === move.toListId
				? destination
				: unaffected
						.filter((task) => task.listId === listId)
						.sort((a, b) => a.position - b.position);
		result.push(...ordered.map((task, position) => ({ ...task, position })));
	}
	return result;
}

function KanbanColumn({
	list,
	tasks,
	canEdit,
	onCreateTask,
	onRename,
	onDelete,
}: {
	list: BoardList;
	tasks: BoardTask[];
	canEdit: boolean;
	onCreateTask: () => void;
	onRename: () => void;
	onDelete: () => void;
}) {
	const { setNodeRef, isOver } = useDroppable({
		id: list.id,
		disabled: !canEdit,
	});
	return (
		<section
			ref={setNodeRef}
			className={cn(
				"flex w-[min(86vw,20rem)] shrink-0 flex-col rounded-xl border border-french_gray-300 bg-platinum-700/70 dark:border-paynes_gray-400 dark:bg-outer_space-400/70",
				isOver && "ring-2 ring-blue_munsell-500",
			)}
		>
			<header className="flex items-center justify-between border-b border-french_gray-300 p-3 dark:border-paynes_gray-400">
				<div className="flex min-w-0 items-center gap-2">
					<h2 className="truncate font-semibold text-outer_space-500 dark:text-platinum-500">
						{list.name}
					</h2>
					<span className="rounded-full bg-white px-2 py-0.5 text-xs text-paynes_gray-500 dark:bg-outer_space-300 dark:text-french_gray-400">
						{tasks.length}
					</span>
				</div>
				{canEdit ? (
					<div className="flex">
						<Button
							size="icon"
							variant="ghost"
							className="size-8"
							onClick={onRename}
							aria-label={`Rename ${list.name}`}
						>
							✎
						</Button>
						<Button
							size="icon"
							variant="ghost"
							className="size-8"
							onClick={onDelete}
							aria-label={`Delete ${list.name}`}
						>
							<Trash2 size={15} />
						</Button>
					</div>
				) : null}
			</header>
			<SortableContext
				items={tasks.map((task) => task.id)}
				strategy={verticalListSortingStrategy}
			>
				<div className="min-h-40 flex-1 space-y-3 p-3">
					{tasks.map((task) => (
						<TaskCard key={task.id} task={task} disabled={!canEdit} />
					))}
					{tasks.length === 0 ? (
						<p className="rounded-lg border border-dashed border-french_gray-300 py-8 text-center text-xs text-paynes_gray-500 dark:border-paynes_gray-400 dark:text-french_gray-400">
							Drop a task here
						</p>
					) : null}
				</div>
			</SortableContext>
			{canEdit ? (
				<div className="p-3 pt-0">
					<Button
						variant="ghost"
						className="w-full border border-dashed border-french_gray-300 dark:border-paynes_gray-400"
						onClick={onCreateTask}
					>
						<Plus size={16} /> Add task
					</Button>
				</div>
			) : null}
		</section>
	);
}

export function KanbanBoard({ data }: { data: ProjectBoardData }) {
	const router = useRouter();
	const [isSaving, startTransition] = useTransition();
	const [message, setMessage] = useState("");
	const hydrate = useBoardStore((state) => state.hydrate);
	const lists = useBoardStore((state) => state.lists);
	const tasks = useBoardStore((state) => state.tasks);
	const search = useBoardStore((state) => state.search);
	const priorityFilter = useBoardStore((state) => state.priorityFilter);
	const setSearch = useBoardStore((state) => state.setSearch);
	const setPriorityFilter = useBoardStore((state) => state.setPriorityFilter);
	const addList = useBoardStore((state) => state.addList);
	const updateListName = useBoardStore((state) => state.updateListName);
	const removeList = useBoardStore((state) => state.removeList);
	const moveTaskLocally = useBoardStore((state) => state.moveTaskLocally);
	const replaceTasks = useBoardStore((state) => state.replaceTasks);
	const removeTasks = useBoardStore((state) => state.removeTasks);
	const openCreateTask = useUIStore((state) => state.openCreateTask);
	const selectedTaskIds = useUIStore((state) => state.selectedTaskIds);
	const clearTaskSelection = useUIStore((state) => state.clearTaskSelection);
	const [optimisticTasks, moveOptimistically] = useOptimistic(
		tasks,
		moveInArray,
	);
	const canEdit = data.project.role !== "viewer";
	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		hydrate(data);
	}, [data, hydrate]);

	useEffect(() => {
		const handleShortcut = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			if (target?.matches("input, textarea, select, [contenteditable='true']"))
				return;
			if (event.key.toLowerCase() === "n" && canEdit && lists[0]) {
				event.preventDefault();
				openCreateTask(lists[0].id);
			}
			if (event.key === "Escape") clearTaskSelection();
		};
		window.addEventListener("keydown", handleShortcut);
		return () => window.removeEventListener("keydown", handleShortcut);
	}, [canEdit, clearTaskSelection, lists, openCreateTask]);

	const filteredTasks = optimisticTasks.filter((task) => {
		if (priorityFilter !== "all" && task.priority !== priorityFilter)
			return false;
		const normalized = search.trim().toLowerCase();
		if (!normalized) return true;
		return [task.title, task.description ?? "", ...task.labels]
			.join(" ")
			.toLowerCase()
			.includes(normalized);
	});

	const onDragEnd = (event: DragEndEvent) => {
		if (!canEdit || !event.over || event.active.id === event.over.id) return;
		const taskId = String(event.active.id);
		const moving = tasks.find((task) => task.id === taskId);
		if (!moving) return;
		const overId = String(event.over.id);
		const overTask = tasks.find((task) => task.id === overId);
		const toListId =
			overTask?.listId ?? lists.find((list) => list.id === overId)?.id;
		if (!toListId) return;
		const targetTasks = tasks
			.filter((task) => task.listId === toListId && task.id !== taskId)
			.sort((a, b) => a.position - b.position);
		const position = overTask
			? Math.max(
					0,
					targetTasks.findIndex((task) => task.id === overTask.id),
				)
			: targetTasks.length;
		const previousTasks = tasks;
		startTransition(async () => {
			moveOptimistically({ taskId, toListId, position });
			moveTaskLocally(taskId, toListId, position);
			const result = await moveTaskAction({
				projectId: data.project.id,
				taskId,
				fromListId: moving.listId,
				toListId,
				position,
			});
			setMessage(result.message);
			if (!result.success) replaceTasks(previousTasks);
		});
	};

	const createList = (formData: FormData) => {
		startTransition(async () => {
			const result = await createListAction(formData);
			setMessage(result.message);
			if (result.success && result.data) addList(result.data);
		});
	};

	const renameList = (list: BoardList) => {
		const name = window.prompt("List name", list.name)?.trim();
		if (!name || name === list.name) return;
		const formData = new FormData();
		formData.set("projectId", data.project.id);
		formData.set("listId", list.id);
		formData.set("name", name);
		startTransition(async () => {
			const result = await updateListAction(formData);
			setMessage(result.message);
			if (result.success) updateListName(list.id, name);
		});
	};

	const deleteList = (list: BoardList) => {
		if (!window.confirm(`Delete “${list.name}” and every task in it?`)) return;
		startTransition(async () => {
			const result = await deleteListAction(data.project.id, list.id);
			setMessage(result.message);
			if (result.success) removeList(list.id);
		});
	};

	const bulkDelete = () => {
		if (!window.confirm(`Delete ${selectedTaskIds.length} selected tasks?`))
			return;
		startTransition(async () => {
			const result = await bulkDeleteTasksAction(
				data.project.id,
				selectedTaskIds,
			);
			setMessage(result.message);
			if (result.success) {
				removeTasks(selectedTaskIds);
				clearTaskSelection();
			}
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-3 rounded-xl border border-french_gray-300 bg-white p-3 dark:border-paynes_gray-400 dark:bg-outer_space-500 md:flex-row md:items-center">
				<div className="relative flex-1">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-paynes_gray-500"
						size={16}
					/>
					<Input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search tasks and labels…"
						className="pl-9"
					/>
				</div>
				<label className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
					<Filter size={16} />
					<span className="sr-only">Filter priority</span>
					<select
						value={priorityFilter}
						onChange={(event) =>
							setPriorityFilter(
								event.target.value as "all" | BoardTask["priority"],
							)
						}
						className="h-10 rounded-lg border border-french_gray-300 bg-white px-3 dark:border-paynes_gray-400 dark:bg-outer_space-400"
					>
						<option value="all">All priorities</option>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</label>
				{selectedTaskIds.length > 0 && canEdit ? (
					<Button variant="danger" onClick={bulkDelete} disabled={isSaving}>
						<Trash2 size={16} /> Delete {selectedTaskIds.length}
					</Button>
				) : null}
			</div>
			<div className="flex items-center justify-between text-xs text-paynes_gray-500 dark:text-french_gray-400">
				<span>
					{message ||
						(isSaving
							? "Saving changes…"
							: "Drag tasks between lists. Press N to create a task.")}
				</span>
				<button
					type="button"
					className="hover:text-blue_munsell-500"
					onClick={() => router.refresh()}
				>
					Refresh board
				</button>
			</div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCorners}
				onDragEnd={onDragEnd}
			>
				<div className="flex gap-4 overflow-x-auto pb-4">
					{lists.map((list) => (
						<KanbanColumn
							key={list.id}
							list={list}
							tasks={filteredTasks
								.filter((task) => task.listId === list.id)
								.sort((a, b) => a.position - b.position)}
							canEdit={canEdit}
							onCreateTask={() => openCreateTask(list.id)}
							onRename={() => renameList(list)}
							onDelete={() => deleteList(list)}
						/>
					))}
					{canEdit ? (
						<form
							action={createList}
							className="w-[min(86vw,20rem)] shrink-0 rounded-xl border border-dashed border-french_gray-300 bg-white p-3 dark:border-paynes_gray-400 dark:bg-outer_space-500"
						>
							<input type="hidden" name="projectId" value={data.project.id} />
							<Input
								name="name"
								required
								maxLength={60}
								placeholder="New list name"
							/>
							<Button
								type="submit"
								variant="secondary"
								className="mt-2 w-full"
								disabled={isSaving}
							>
								<Plus size={16} /> Add list
							</Button>
						</form>
					) : null}
				</div>
			</DndContext>
			<CreateTaskModal projectId={data.project.id} />
			<TaskDetailModal projectId={data.project.id} />
		</div>
	);
}
