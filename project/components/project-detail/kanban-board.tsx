"use client";

import {
	type CollisionDetection,
	closestCorners,
	DndContext,
	type DragEndEvent,
	DragOverlay,
	type DragOverEvent,
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
import { CalendarDays, Filter, LayoutGrid, List, MessageSquare, Plus, Search, Trash2 } from "lucide-react";
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
} from "@/components/project-detail/create-task-modal";
import { TaskCard } from "@/components/project-detail/task-card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn, decodeLabel, formatDate } from "@/lib/utils";
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
					{task.labels.slice(0, 3).map((label) => {
						const decoded = decodeLabel(label);
						return <span key={label} className="rounded-full border px-2 py-0.5 text-[10px] font-medium" style={{ borderColor: `${decoded.color}55`, backgroundColor: `${decoded.color}18`, color: decoded.color }}>{decoded.name}</span>;
					})}
				</div>
			) : null}
		</div>
	);
}

function columnAccent(name: string) {
	const normalized = name.trim().toLowerCase();
	if (normalized.includes("progress")) return "bg-violet-500";
	if (normalized.includes("review")) return "bg-amber-500";
	if (["done", "complete", "completed"].includes(normalized)) return "bg-emerald-500";
	if (normalized.includes("block")) return "bg-rose-500";
	return "bg-blue-500";
}

function TaskListView({ tasks, lists }: { tasks: BoardTask[]; lists: BoardList[] }) {
	const openTaskDetail = useUIStore((state) => state.openTaskDetail);
	const listNames = new Map(lists.map((list) => [list.id, list.name]));

	return (
		<div className="min-h-[34rem] overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<div className="hidden grid-cols-[minmax(16rem,2fr)_1fr_0.8fr_1fr_0.8fr] gap-4 border-b border-french_gray-300 bg-platinum-50/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-paynes_gray-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-french_gray-400 md:grid">
				<span>Task</span><span>Status</span><span>Priority</span><span>Assignee</span><span>Due date</span>
			</div>
			{tasks.length ? tasks.map((task) => (
				<button key={task.id} type="button" onClick={() => openTaskDetail(task.id)} className="grid w-full gap-3 border-b border-french_gray-200 px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-platinum-50 dark:border-paynes_gray-400 dark:hover:bg-outer_space-400 md:grid-cols-[minmax(16rem,2fr)_1fr_0.8fr_1fr_0.8fr] md:items-center md:gap-4">
					<div className="min-w-0">
						<p className="truncate text-sm font-semibold text-outer_space-500 dark:text-platinum-500">{task.title}</p>
						<div className="mt-1 flex flex-wrap gap-1">{task.labels.slice(0, 2).map((label) => { const decoded = decodeLabel(label); return <Badge key={label} style={{ borderColor: `${decoded.color}55`, backgroundColor: `${decoded.color}18`, color: decoded.color }}>{decoded.name}</Badge>; })}</div>
					</div>
					<div className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400"><span className={cn("size-2 rounded-full", columnAccent(listNames.get(task.listId) ?? ""))} />{listNames.get(task.listId) ?? "Unknown"}</div>
					<span className="text-sm capitalize text-paynes_gray-500 dark:text-french_gray-400">{task.priority}</span>
					<div className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">{task.assignee ? <><Avatar name={task.assignee.name} src={task.assignee.avatarUrl} className="size-7" /><span className="truncate">{task.assignee.name}</span></> : <span>Unassigned</span>}</div>
					<div className="flex items-center gap-1.5 text-sm text-paynes_gray-500 dark:text-french_gray-400">{task.dueDate ? <><CalendarDays size={14} />{formatDate(task.dueDate, { year: undefined })}</> : "No deadline"}{task.commentsCount > 0 ? <span className="ml-auto flex items-center gap-1"><MessageSquare size={13} />{task.commentsCount}</span> : null}</div>
				</button>
			)) : <div className="flex min-h-[28rem] items-center justify-center text-sm text-paynes_gray-500 dark:text-french_gray-400">No tasks match the current filters.</div>}
		</div>
	);
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
				"flex min-h-[34rem] w-[min(86vw,19rem)] shrink-0 flex-col rounded-xl border border-french_gray-300 bg-platinum-50/60 transition-[box-shadow,background-color] duration-150 dark:border-paynes_gray-400 dark:bg-outer_space-500",
				isOver && "bg-blue_munsell-500/5 ring-2 ring-blue_munsell-500",
			)}
		>
			<header className="flex items-center justify-between border-b border-french_gray-300 p-3 dark:border-paynes_gray-400">
				<div className="flex min-w-0 items-center gap-2">
					<span className={cn("size-2.5 shrink-0 rounded-full", columnAccent(list.name))} />
					<h2 className="truncate font-semibold text-outer_space-500 dark:text-platinum-500">
						{list.name}
					</h2>
					<span className="rounded-full bg-white px-2 py-0.5 text-xs text-paynes_gray-500 dark:bg-outer_space-300 dark:text-french_gray-400">
						{tasks.length}
					</span>
				</div>

				{canEdit ? (
					<div className="flex">
						<Button size="icon" variant="ghost" className="size-8" onClick={onCreateTask} aria-label={`Add task to ${list.name}`}>
							<Plus size={16} />
						</Button>
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
				<div className="min-h-40 flex-1 space-y-2 p-2.5">
					{tasks.map((task) => (
						<div
							key={task.id}
							className={cn(
								"transition-opacity duration-150",
								activeTaskId === task.id && "opacity-25",
							)}
						>
							<TaskCard task={task} disabled={!canEdit} accentClass={columnAccent(list.name)} />
						</div>
					))}

					{tasks.length === 0 ? (
						<p className="rounded-lg border border-dashed border-french_gray-300 py-8 text-center text-xs text-paynes_gray-500 dark:border-paynes_gray-400 dark:text-french_gray-400">
							No tasks in this stage
						</p>
					) : null}
				</div>
			</SortableContext>

			{canEdit ? (
				<div className="p-3 pt-0">
					<Button
						variant="ghost"
						className="w-full justify-start text-blue_munsell-500"
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
	const [listToDelete, setListToDelete] = useState<BoardList | null>(null);
	const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	const [listToRename, setListToRename] = useState<BoardList | null>(null);
	const [listName, setListName] = useState("");
	const [renameError, setRenameError] = useState("");
	const [viewMode, setViewMode] = useState<"board" | "list">("board");

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
				delay: 250,
				tolerance: 6,
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
		setActiveTaskId(taskId);
		setMessage("");
	};

	const getMoveTarget = (
		event: DragOverEvent | DragEndEvent,
		currentTasks: BoardTask[],
	) => {
		if (!event.over) return null;

		const taskId = String(event.active.id);
		const overId = String(event.over.id);
		const activeTask = currentTasks.find((task) => task.id === taskId);

		if (overId === taskId && activeTask) {
			return {
				taskId,
				toListId: activeTask.listId,
				position: activeTask.position,
			};
		}

		const overTask = currentTasks.find((task) => task.id === overId);
		const targetListId =
			overTask?.listId ?? lists.find((list) => list.id === overId)?.id;

		if (!targetListId) return null;

		const destination = currentTasks
			.filter((task) => task.listId === targetListId && task.id !== taskId)
			.sort((a, b) => a.position - b.position);
		let position = destination.length;

		if (overTask && overTask.id !== taskId) {
			const overIndex = destination.findIndex((task) => task.id === overTask.id);
			const translated = event.active.rect.current.translated;
			const isBelow = translated
				? translated.top + translated.height / 2 >
					event.over.rect.top + event.over.rect.height / 2
				: false;

			if (overIndex >= 0) position = overIndex + (isBelow ? 1 : 0);
		}

		return { taskId, toListId: targetListId, position };
	};

	const onDragOver = (event: DragOverEvent) => {
		if (!canEdit || !dragSnapshotRef.current) return;

		const move = getMoveTarget(event, tasksRef.current);
		if (!move) return;

		const moving = tasksRef.current.find((task) => task.id === move.taskId);
		if (
			moving?.listId === move.toListId &&
			moving.position === move.position
		)
			return;

		const nextTasks = moveInArray(tasksRef.current, move);
		tasksRef.current = nextTasks;
		replaceTasks(nextTasks);
	};

	const onDragEnd = (event: DragEndEvent) => {
		const taskId = String(event.active.id);
		const snapshot = dragSnapshotRef.current;

		setActiveTaskId(null);

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
		const finalMove = getMoveTarget(event, tasksRef.current);

		if (!originalTask || !finalMove) {
			tasksRef.current = snapshot;
			replaceTasks(snapshot);
			dragSnapshotRef.current = null;
			return;
		}

		const nextTasks = moveInArray(tasksRef.current, finalMove);
		const finalTask = nextTasks.find((task) => task.id === taskId);
		const didMove = Boolean(finalTask && (originalTask.listId !== finalTask.listId || originalTask.position !== finalTask.position));

		if (!didMove) {
			dragSnapshotRef.current = null;
			return;
		}

		if (!finalTask) return;
		const finalListId = finalTask.listId;
		const finalPosition = finalTask.position;
		tasksRef.current = nextTasks;
		replaceTasks(nextTasks);
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
		setActiveTaskId(null);
	};

	const createList = (formData: FormData) => {
		startTransition(async () => {
			const result = await createListAction(formData);
			setMessage(result.message);
			if (result.success && result.data) addList(result.data);
		});
	};

	const openRenameModal = (list: BoardList) => {
		setListToRename(list);
		setListName(list.name);
		setRenameError("");
	};

	const closeRenameModal = () => {
		if (!isSaving) setListToRename(null);
	};

	const renameList = () => {
		const name = listName.trim();
		if (!listToRename || !name) {
			setRenameError("List name is required.");
			return;
		}
		if (name === listToRename.name) {
			closeRenameModal();
			return;
		}

		const formData = new FormData();
		formData.set("projectId", data.project.id);
		formData.set("listId", listToRename.id);
		formData.set("name", name);
		const listId = listToRename.id;

		startTransition(async () => {
			const result = await updateListAction(formData);
			setMessage(result.message);
			if (result.success) {
				updateListName(listId, name);
				setListToRename(null);
			} else setRenameError(result.message);
		});
	};

	const deleteList = (list: BoardList) => {
		startTransition(async () => {
			const result = await deleteListAction(data.project.id, list.id);
			setMessage(result.message);
			if (result.success) {
				removeList(list.id);
				setListToDelete(null);
			} else setDeleteError(result.message);
		});
	};

	const bulkDelete = () => {
		startTransition(async () => {
			const result = await bulkDeleteTasksAction(
				data.project.id,
				selectedTaskIds,
			);

			setMessage(result.message);

			if (result.success) {
				removeTasks(selectedTaskIds);
				clearTaskSelection();
				setBulkDeleteOpen(false);
			} else setDeleteError(result.message);
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

				<div className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
					<Filter size={16} />
					<span className="sr-only">Filter priority</span>
					<Select
						value={priorityFilter}
						onValueChange={(value) =>
							setPriorityFilter(
								value as "all" | BoardTask["priority"],
							)
						}
						className="w-40"
						options={[{ value: "all", label: "All priorities" }, { value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]}
					/>
				</div>

				<fieldset className="flex rounded-lg border border-french_gray-300 bg-platinum-50 p-1 dark:border-paynes_gray-400 dark:bg-outer_space-400">
					<legend className="sr-only">Task view</legend>
					<Button type="button" size="sm" variant={viewMode === "board" ? "default" : "ghost"} className="h-8 gap-1.5 px-2.5" onClick={() => setViewMode("board")} aria-pressed={viewMode === "board"}>
						<LayoutGrid size={15} /> Board
					</Button>
					<Button type="button" size="sm" variant={viewMode === "list" ? "default" : "ghost"} className="h-8 gap-1.5 px-2.5" onClick={() => setViewMode("list")} aria-pressed={viewMode === "list"}>
						<List size={15} /> List
					</Button>
				</fieldset>

				{selectedTaskIds.length > 0 && canEdit ? (
					<Button
						variant="danger"
						onClick={() => {
							setDeleteError("");
							setBulkDeleteOpen(true);
						}}
						disabled={isSaving}
					>
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
								: "Click a task to open it, or drag it to reorder. Press N to create a task.")}
				</span>
				<button
					type="button"
					className="hover:text-blue_munsell-500"
					onClick={() => router.refresh()}
				>
					Refresh board
				</button>
			</div>

			{viewMode === "board" ? <DndContext
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
							onRename={() => openRenameModal(list)}
							onDelete={() => {
								setDeleteError("");
								setListToDelete(list);
							}}
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
			</DndContext> : <TaskListView tasks={filteredTasks} lists={lists} />}

			<CreateTaskModal projectId={data.project.id} />
			<TaskDetailModal projectId={data.project.id} />
			<Modal
				open={listToRename !== null}
				onClose={closeRenameModal}
				title="Rename list"
				description="Choose a clear name for this stage of the board."
				className="max-w-md"
			>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						renameList();
					}}
					className="space-y-5"
				>
					<div className="space-y-1.5">
						<Label htmlFor="rename-list-name">List name</Label>
						<Input
							id="rename-list-name"
							value={listName}
							onChange={(event) => {
								setListName(event.target.value);
								setRenameError("");
							}}
							required
							maxLength={60}
							autoFocus
						/>
						{renameError ? (
							<p
								role="alert"
								className="text-sm text-red-600 dark:text-red-400"
							>
								{renameError}
							</p>
						) : null}
					</div>
					<div className="flex justify-end gap-2">
						<Button
							variant="secondary"
							onClick={closeRenameModal}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSaving || !listName.trim()}>
							{isSaving ? "Renaming…" : "Rename list"}
						</Button>
					</div>
				</form>
			</Modal>
			<ConfirmationModal
				open={listToDelete !== null}
				onClose={() => {
					if (!isSaving) setListToDelete(null);
				}}
				onConfirm={() => {
					if (listToDelete) deleteList(listToDelete);
				}}
				title="Delete list?"
				confirmLabel="Delete list"
				pending={isSaving}
				error={deleteError}
			>
				<p>
					Deleting <strong>{listToDelete?.name}</strong> will permanently remove
					the list and every task in it.
				</p>
			</ConfirmationModal>
			<ConfirmationModal
				open={bulkDeleteOpen}
				onClose={() => {
					if (!isSaving) setBulkDeleteOpen(false);
				}}
				onConfirm={bulkDelete}
				title="Delete selected tasks?"
				confirmLabel={`Delete ${selectedTaskIds.length} tasks`}
				pending={isSaving}
				error={deleteError}
			>
				<p>
					The <strong>{selectedTaskIds.length} selected tasks</strong> will be
					permanently removed.
				</p>
			</ConfirmationModal>
		</div>
	);
}
