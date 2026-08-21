"use client";

import {
	type CollisionDetection,
	closestCorners,
	DndContext,
	type DragEndEvent,
	type DragOverEvent,
	DragOverlay,
	type DragStartEvent,
	KeyboardSensor,
	MouseSensor,
	pointerWithin,
	TouchSensor,
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
import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from "react";
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

interface TaskMove {
	taskId: string;
	toListId: string;
	position: number;
}

function moveInArray(tasks: BoardTask[], move: TaskMove) {
	const moving = tasks.find((task) => task.id === move.taskId);
	if (!moving) return tasks;

	const unaffected = tasks.filter((task) => task.id !== move.taskId);
	const destination = unaffected
		.filter((task) => task.listId === move.toListId)
		.sort((a, b) => a.position - b.position);

	const safePosition = Math.max(0, Math.min(move.position, destination.length));

	destination.splice(safePosition, 0, {
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

		result.push(
			...ordered.map((task, position) => ({
				...task,
				position,
			})),
		);
	}

	return result;
}

function TaskDragPreview({ task }: { task: BoardTask }) {
	return (
		<div className="w-[min(86vw,20rem)] rotate-1 cursor-grabbing rounded-xl border border-blue_munsell-400 bg-white p-3 shadow-2xl ring-2 ring-blue_munsell-500/20 dark:border-blue_munsell-500 dark:bg-outer_space-400">
			<div className="flex items-start justify-between gap-3">
				<p className="min-w-0 flex-1 truncate text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
					{task.title}
				</p>
				<span className="shrink-0 rounded-full bg-platinum-700 px-2 py-0.5 text-[10px] font-medium capitalize text-paynes_gray-500 dark:bg-outer_space-300 dark:text-french_gray-400">
					{task.priority}
				</span>
			</div>
			{task.description ? (
				<p className="mt-2 line-clamp-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
					{task.description}
				</p>
			) : null}
			{task.labels.length > 0 ? (
				<div className="mt-2 flex flex-wrap gap-1">
					{task.labels.slice(0, 3).map((label) => (
						<span
							key={label}
							className="rounded-full bg-blue_munsell-500/10 px-2 py-0.5 text-[10px] text-blue_munsell-600 dark:text-blue_munsell-300"
						>
							{label}
						</span>
					))}
				</div>
			) : null}
		</div>
	);
}

function columnTone(name: string) {
	const normalized = name.trim().toLowerCase();
	if (normalized.includes("progress"))
		return "border-amber-200/80 bg-amber-50/45 dark:border-amber-900/50 dark:bg-amber-950/10";
	if (normalized.includes("review"))
		return "border-sky-200/80 bg-sky-50/45 dark:border-sky-900/50 dark:bg-sky-950/10";
	if (["done", "complete", "completed"].includes(normalized))
		return "border-emerald-200/80 bg-emerald-50/45 dark:border-emerald-900/50 dark:bg-emerald-950/10";
	if (normalized.includes("block"))
		return "border-rose-200/80 bg-rose-50/45 dark:border-rose-900/50 dark:bg-rose-950/10";
	return "border-violet-200/70 bg-violet-50/30 dark:border-violet-900/50 dark:bg-violet-950/10";
}

function KanbanColumn({
	list,
	tasks,
	canEdit,
	activeTaskId,
	onCreateTask,
	onRename,
	onDelete,
}: {
	list: BoardList;
	tasks: BoardTask[];
	canEdit: boolean;
	activeTaskId: string | null;
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
				"flex w-[min(86vw,19rem)] shrink-0 flex-col rounded-2xl border transition-[box-shadow,background-color] duration-150",
				columnTone(list.name),
				isOver && "bg-blue_munsell-500/5 ring-2 ring-blue_munsell-500",
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
						<div
							key={task.id}
							className={cn(
								"transition-opacity duration-150",
								activeTaskId === task.id && "opacity-25",
							)}
						>
							<TaskCard task={task} disabled={!canEdit} />
						</div>
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
	const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

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
	const replaceTasks = useBoardStore((state) => state.replaceTasks);
	const removeTasks = useBoardStore((state) => state.removeTasks);

	const openCreateTask = useUIStore((state) => state.openCreateTask);
	const selectedTaskIds = useUIStore((state) => state.selectedTaskIds);
	const clearTaskSelection = useUIStore((state) => state.clearTaskSelection);

	const canEdit = data.project.role !== "viewer";

	const tasksRef = useRef(tasks);
	const dragSnapshotRef = useRef<BoardTask[] | null>(null);
	const lastMoveRef = useRef<string | null>(null);

	useEffect(() => {
		tasksRef.current = tasks;
	}, [tasks]);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: {
				distance: 6,
			},
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: 180,
				tolerance: 8,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const taskIdSet = useMemo(
		() => new Set(tasks.map((task) => task.id)),
		[tasks],
	);

	const collisionDetectionStrategy = useCallback<CollisionDetection>(
		(args) => {
			const pointerCollisions = pointerWithin(args);

			if (pointerCollisions.length > 0) {
				const taskCollision = pointerCollisions.find((collision) =>
					taskIdSet.has(String(collision.id)),
				);

				return taskCollision ? [taskCollision] : pointerCollisions;
			}

			return closestCorners(args);
		},
		[taskIdSet],
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

	const filteredTasks = tasks.filter((task) => {
		if (priorityFilter !== "all" && task.priority !== priorityFilter)
			return false;

		const normalized = search.trim().toLowerCase();
		if (!normalized) return true;

		return [task.title, task.description ?? "", ...task.labels]
			.join(" ")
			.toLowerCase()
			.includes(normalized);
	});

	const activeTask = activeTaskId
		? (tasks.find((task) => task.id === activeTaskId) ??
			dragSnapshotRef.current?.find((task) => task.id === activeTaskId) ??
			null)
		: null;

	const onDragStart = (event: DragStartEvent) => {
		if (!canEdit) return;

		const taskId = String(event.active.id);
		const moving = tasksRef.current.find((task) => task.id === taskId);
		if (!moving) return;

		dragSnapshotRef.current = tasksRef.current.map((task) => ({ ...task }));
		lastMoveRef.current = null;
		setActiveTaskId(taskId);
		setMessage("");
	};

	const onDragOver = (event: DragOverEvent) => {
		if (!canEdit || !event.over) return;

		const taskId = String(event.active.id);
		const overId = String(event.over.id);

		if (taskId === overId) return;

		const currentTasks = tasksRef.current;
		const moving = currentTasks.find((task) => task.id === taskId);
		if (!moving) return;

		const overTask = currentTasks.find((task) => task.id === overId);
		const targetListId =
			overTask?.listId ?? lists.find((list) => list.id === overId)?.id;

		if (!targetListId) return;

		const targetTasks = currentTasks
			.filter((task) => task.listId === targetListId && task.id !== taskId)
			.sort((a, b) => a.position - b.position);

		let position = targetTasks.length;

		if (overTask) {
			const overIndex = targetTasks.findIndex(
				(task) => task.id === overTask.id,
			);

			if (overIndex >= 0) {
				const translated = event.active.rect.current.translated;
				const isBelowOverTask = translated
					? translated.top > event.over.rect.top + event.over.rect.height / 2
					: false;

				position = overIndex + (isBelowOverTask ? 1 : 0);
			}
		}

		const moveKey = `${taskId}:${targetListId}:${position}`;
		if (lastMoveRef.current === moveKey) return;

		if (moving.listId === targetListId && moving.position === position) {
			lastMoveRef.current = moveKey;
			return;
		}

		const nextTasks = moveInArray(currentTasks, {
			taskId,
			toListId: targetListId,
			position,
		});

		tasksRef.current = nextTasks;
		lastMoveRef.current = moveKey;
		replaceTasks(nextTasks);
	};

	const onDragEnd = (event: DragEndEvent) => {
		const taskId = String(event.active.id);
		const snapshot = dragSnapshotRef.current;

		setActiveTaskId(null);
		lastMoveRef.current = null;

		if (!canEdit || !snapshot) {
			dragSnapshotRef.current = null;
			return;
		}

		if (!event.over) {
			tasksRef.current = snapshot;
			replaceTasks(snapshot);
			dragSnapshotRef.current = null;
			return;
		}

		const originalTask = snapshot.find((task) => task.id === taskId);
		const finalTask = tasksRef.current.find((task) => task.id === taskId);

		if (!originalTask || !finalTask) {
			tasksRef.current = snapshot;
			replaceTasks(snapshot);
			dragSnapshotRef.current = null;
			return;
		}

		const didMove =
			originalTask.listId !== finalTask.listId ||
			originalTask.position !== finalTask.position;

		if (!didMove) {
			dragSnapshotRef.current = null;
			return;
		}

		const finalListId = finalTask.listId;
		const finalPosition = finalTask.position;
		dragSnapshotRef.current = null;

		startTransition(async () => {
			const result = await moveTaskAction({
				projectId: data.project.id,
				taskId,
				fromListId: originalTask.listId,
				toListId: finalListId,
				position: finalPosition,
			});

			setMessage(result.message);

			if (!result.success) {
				tasksRef.current = snapshot;
				replaceTasks(snapshot);
			}
		});
	};

	const onDragCancel = () => {
		const snapshot = dragSnapshotRef.current;

		if (snapshot) {
			tasksRef.current = snapshot;
			replaceTasks(snapshot);
		}

		dragSnapshotRef.current = null;
		lastMoveRef.current = null;
		setActiveTaskId(null);
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
			<div className="flowora-panel flex flex-col gap-3 rounded-2xl border border-french_gray-300 bg-white p-3 dark:border-paynes_gray-800 dark:bg-outer_space-500 md:flex-row md:items-center">
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
							: activeTaskId
								? "Release to drop task."
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
				collisionDetection={collisionDetectionStrategy}
				onDragStart={onDragStart}
				onDragOver={onDragOver}
				onDragEnd={onDragEnd}
				onDragCancel={onDragCancel}
			>
				<div className="flex gap-4 overflow-x-auto pb-5 scrollbar-thin">
					{lists.map((list) => (
						<KanbanColumn
							key={list.id}
							list={list}
							tasks={filteredTasks
								.filter((task) => task.listId === list.id)
								.sort((a, b) => a.position - b.position)}
							canEdit={canEdit}
							activeTaskId={activeTaskId}
							onCreateTask={() => openCreateTask(list.id)}
							onRename={() => renameList(list)}
							onDelete={() => deleteList(list)}
						/>
					))}

					{canEdit ? (
						<form
							action={createList}
							className="w-[min(86vw,19rem)] shrink-0 rounded-2xl border border-dashed border-french_gray-300 bg-white p-3 dark:border-paynes_gray-800 dark:bg-outer_space-500"
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

				<DragOverlay
					zIndex={50}
					dropAnimation={{
						duration: 180,
						easing: "cubic-bezier(0.2, 0, 0, 1)",
					}}
				>
					{activeTask ? <TaskDragPreview task={activeTask} /> : null}
				</DragOverlay>
			</DndContext>

			<CreateTaskModal projectId={data.project.id} />
			<TaskDetailModal projectId={data.project.id} />
		</div>
	);
}
