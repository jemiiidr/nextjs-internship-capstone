"use client";

import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	Clock3,
	ListTodo,
	MessageSquare,
	Pencil,
	UserRound,
} from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
	addCommentAction,
	getTaskCommentsAction,
} from "@/app/actions/comments";
import {
	createTaskAction,
	deleteTaskAction,
	updateTaskAction,
} from "@/app/actions/tasks";
import { LabelEditor } from "@/components/project-detail/label-editor";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DeadlineInput } from "@/components/ui/deadline-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn, decodeLabel, formatDate, formatRelativeDate } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import type { ActionResult, BoardTask, TaskComment } from "@/types";

const initialTaskState: ActionResult<BoardTask> = {
	success: false,
	message: "",
};

const COMMENTS_PER_PAGE = 5;

const priorityClasses: Record<BoardTask["priority"], string> = {
	low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
	medium:
		"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
	high: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
};

function TaskDetailsView({
	task,
	canEdit,
	onEdit,
}: {
	task: BoardTask;
	canEdit: boolean;
	onEdit: () => void;
}) {
	const lists = useBoardStore((state) => state.lists);
	const status =
		lists.find((list) => list.id === task.listId)?.name ?? "Unknown";
	const deadlineTime = task.dueDate
		? new Intl.DateTimeFormat("en-US", {
				hour: "numeric",
				minute: "2-digit",
				timeZone: "UTC",
			}).format(new Date(task.dueDate))
		: null;

	return (
		<div className="space-y-6">
			<div>
				<div className="min-w-0">
					<p className="mb-1.5 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
						Title
					</p>
					<h3 className="mt-1 break-words text-xl font-semibold text-outer_space-500 dark:text-platinum-500">
						{task.title}
					</h3>
				</div>
			</div>

			<div>
				<p className="mb-1.5 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
					Description
				</p>
				<p className="whitespace-pre-wrap break-words text-sm leading-6 text-paynes_gray-600 dark:text-french_gray-300">
					{task.description?.trim() || "No description provided."}
				</p>
			</div>

			<dl className="grid gap-3 sm:grid-cols-2">
				<div className="rounded-xl border border-french_gray-200 p-3 dark:border-paynes_gray-700">
					<dt className="flex items-center gap-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
						<ListTodo size={14} /> Status
					</dt>
					<dd className="mt-2 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
						{status}
					</dd>
				</div>
				<div className="rounded-xl border border-french_gray-200 p-3 dark:border-paynes_gray-700">
					<dt className="text-xs text-paynes_gray-500 dark:text-french_gray-400">
						Priority
					</dt>
					<dd className="mt-2">
						<Badge className={cn("capitalize", priorityClasses[task.priority])}>
							{task.priority}
						</Badge>
					</dd>
				</div>
				<div className="rounded-xl border border-french_gray-200 p-3 dark:border-paynes_gray-700">
					<dt className="flex items-center gap-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
						<CalendarDays size={14} /> Deadline
					</dt>
					<dd className="mt-2 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
						{task.dueDate
							? `${formatDate(task.dueDate, { timeZone: "UTC" })} at ${deadlineTime}`
							: "No deadline"}
					</dd>
				</div>
				<div className="rounded-xl border border-french_gray-200 p-3 dark:border-paynes_gray-700">
					<dt className="flex items-center gap-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
						<UserRound size={14} /> Assignee
					</dt>
					<dd className="mt-2 flex items-center gap-2 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
						{task.assignee ? (
							<Avatar
								name={task.assignee.name}
								src={task.assignee.avatarUrl}
								className="size-6"
							/>
						) : null}
						{task.assignee?.name ?? "Unassigned"}
					</dd>
				</div>
			</dl>

			<div>
				<p className="mb-2 text-sm font-medium text-outer_space-500 dark:text-platinum-500">
					Labels
				</p>
				<div className="flex flex-wrap gap-2">
					{task.labels.length ? (
						task.labels.map((value) => {
							const label = decodeLabel(value);
							return (
								<Badge key={value}>
									<span
										className="size-2 rounded-full"
										style={{ backgroundColor: label.color }}
									/>
									{label.name}
								</Badge>
							);
						})
					) : (
						<span className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
							No labels
						</span>
					)}
				</div>
			</div>

			{canEdit ? (
				<div className="flex justify-end border-t border-french_gray-200 pt-4 dark:border-paynes_gray-700">
					<Button type="button" size="sm" onClick={onEdit}>
						<Pencil size={15} /> Edit task details
					</Button>
				</div>
			) : null}
		</div>
	);
}

function TaskForm({
	projectId,
	listId,
	task,
	onClose,
	onDelete,
}: {
	projectId: string;
	listId: string;
	task?: BoardTask;
	onClose: () => void;
	onDelete?: () => void;
}) {
	const members = useBoardStore((state) => state.members);
	const lists = useBoardStore((state) => state.lists);
	const addTask = useBoardStore((state) => state.addTask);
	const updateTask = useBoardStore((state) => state.updateTask);
	const [state, formAction, pending] = useActionState(
		async (_previous: ActionResult<BoardTask>, formData: FormData) =>
			task ? updateTaskAction(formData) : createTaskAction(formData),
		initialTaskState,
	);

	useEffect(() => {
		if (!state.success || !state.data) return;
		if (task) updateTask(state.data);
		else addTask(state.data);
		onClose();
	}, [addTask, onClose, state.data, state.success, task, updateTask]);

	return (
		<form action={formAction} className="space-y-4">
			<input type="hidden" name="projectId" value={projectId} />
			{task ? null : <input type="hidden" name="listId" value={listId} />}
			{task ? <input type="hidden" name="taskId" value={task.id} /> : null}
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-title`}>Title</Label>
				<Input
					id={`${task?.id ?? "new"}-title`}
					name="title"
					defaultValue={task?.title}
					required
					maxLength={200}
					autoFocus
				/>
				{state.fieldErrors?.title?.[0] ? (
					<p className="text-xs text-red-600">{state.fieldErrors.title[0]}</p>
				) : null}
			</div>
			{task ? (
				<div className="space-y-1.5">
					<Label htmlFor={`${task.id}-status`}>Status</Label>
					<Select
						id={`${task.id}-status`}
						name="listId"
						defaultValue={task.listId}
						options={lists.map((list) => ({
							value: list.id,
							label: list.name,
						}))}
					/>
				</div>
			) : null}
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-description`}>Description</Label>
				<Textarea
					id={`${task?.id ?? "new"}-description`}
					name="description"
					defaultValue={task?.description ?? ""}
					maxLength={2000}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-3">
				<div className="space-y-1.5">
					<Label htmlFor={`${task?.id ?? "new"}-priority`}>Priority</Label>
					<Select
						id={`${task?.id ?? "new"}-priority`}
						name="priority"
						defaultValue={task?.priority ?? "medium"}
						options={[
							{ value: "low", label: "Low" },
							{ value: "medium", label: "Medium" },
							{ value: "high", label: "High" },
						]}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`${task?.id ?? "new"}-due`}>Deadline date</Label>
					<DeadlineInput
						id={`${task?.id ?? "new"}-due`}
						name="dueDate"
						defaultValue={task?.dueDate?.slice(0, 10)}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`${task?.id ?? "new"}-due-time`}>Deadline time</Label>
					<div className="relative">
						<Input
							id={`${task?.id ?? "new"}-due-time`}
							name="dueTime"
							type="time"
							defaultValue={
								task?.dueDate ? task.dueDate.slice(11, 16) : "23:59"
							}
							className="relative pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:size-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
						/>
						<Clock3
							size={16}
							aria-hidden="true"
							className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-paynes_gray-500 dark:text-french_gray-400"
						/>
					</div>
					{state.fieldErrors?.dueTime?.[0] ? (
						<p className="text-xs text-red-600">
							{state.fieldErrors.dueTime[0]}
						</p>
					) : null}
				</div>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-assignee`}>Assignee</Label>
				<Select
					id={`${task?.id ?? "new"}-assignee`}
					name="assigneeId"
					defaultValue={task?.assigneeId ?? ""}
					options={[
						{ value: "", label: "Unassigned" },
						...members.map((member) => ({
							value: member.user.id,
							label: `${member.user.name} · ${member.role}`,
						})),
					]}
				/>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-labels`}>Labels</Label>
				<LabelEditor initialLabels={task?.labels} />
			</div>
			{state.message && !state.success ? (
				<p role="alert" className="text-sm text-red-600">
					{state.message}
				</p>
			) : null}
			<div className="flex justify-end gap-2">
				<Button variant="secondary" onClick={onClose}>
					Cancel
				</Button>
				{task && onDelete ? (
					<Button
						variant="danger"
						onClick={onDelete}
						className="bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
					>
						Delete task
					</Button>
				) : null}
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : task ? "Save task" : "Create task"}
				</Button>
			</div>
		</form>
	);
}

function Comments({ projectId, task }: { projectId: string; task: BoardTask }) {
	const [comments, setComments] = useState<TaskComment[]>([]);
	const [page, setPage] = useState(1);
	const [message, setMessage] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		let active = true;
		startTransition(async () => {
			const result = await getTaskCommentsAction(projectId, task.id);
			if (active && result.success) {
				setComments(result.data ?? []);
				setPage(1);
			}
		});
		return () => {
			active = false;
		};
	}, [projectId, task.id]);

	const submitComment = (formData: FormData) => {
		startTransition(async () => {
			const result = await addCommentAction(formData);
			setMessage(result.message);
			if (result.success && result.data) {
				setComments((items) => {
					const nextComments = [...items, result.data as TaskComment];
					setPage(Math.ceil(nextComments.length / COMMENTS_PER_PAGE));
					return nextComments;
				});
			}
		});
	};
	const pageCount = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE));
	const visibleComments = comments.slice(
		(page - 1) * COMMENTS_PER_PAGE,
		page * COMMENTS_PER_PAGE,
	);

	return (
		<section className="flex min-h-0 flex-col border-t border-french_gray-300 pt-5 dark:border-paynes_gray-400 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
			<h3 className="mb-3 flex items-center gap-2 font-semibold text-outer_space-500 dark:text-platinum-500">
				<MessageSquare size={17} /> Comments ({comments.length})
			</h3>
			<div className="min-h-48 flex-1 space-y-3 overflow-y-auto pr-1 lg:max-h-[45vh]">
				{comments.length === 0 ? (
					<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
						No comments yet.
					</p>
				) : (
					visibleComments.map((comment) => (
						<div
							key={comment.id}
							className="flex gap-2 rounded-lg bg-platinum-700 p-3 dark:bg-outer_space-300"
						>
							<Avatar
								name={comment.author.name}
								src={comment.author.avatarUrl}
							/>
							<div className="min-w-0">
								<div className="flex flex-wrap items-baseline gap-x-2">
									<strong className="text-sm text-outer_space-500 dark:text-platinum-500">
										{comment.author.name}
									</strong>
									<span className="text-xs text-paynes_gray-500">
										{formatRelativeDate(comment.createdAt)}
									</span>
								</div>
								<p className="mt-1 whitespace-pre-wrap break-words text-sm text-paynes_gray-500 dark:text-french_gray-400">
									{comment.content}
								</p>
							</div>
						</div>
					))
				)}
			</div>
			{comments.length > COMMENTS_PER_PAGE ? (
				<nav
					aria-label="Comments pagination"
					className="mt-3 flex items-center justify-between border-t border-french_gray-200 pt-3 text-xs dark:border-paynes_gray-700"
				>
					<span className="text-paynes_gray-500">
						Page {page} of {pageCount}
					</span>
					<div className="flex items-center gap-1">
						<Button
							type="button"
							variant="secondary"
							size="icon"
							aria-label="Previous comments page"
							disabled={page === 1}
							onClick={() => setPage((current) => Math.max(1, current - 1))}
						>
							<ChevronLeft size={15} />
						</Button>
						<Button
							type="button"
							variant="secondary"
							size="icon"
							aria-label="Next comments page"
							disabled={page === pageCount}
							onClick={() =>
								setPage((current) => Math.min(pageCount, current + 1))
							}
						>
							<ChevronRight size={15} />
						</Button>
					</div>
				</nav>
			) : null}
			<form action={submitComment} className="mt-4 space-y-2">
				<input type="hidden" name="projectId" value={projectId} />
				<input type="hidden" name="taskId" value={task.id} />
				<Textarea
					name="content"
					required
					maxLength={1000}
					placeholder="Add a comment…"
					className="min-h-20"
				/>
				<div className="flex items-center justify-between">
					<span className="text-xs text-paynes_gray-500">{message}</span>
					<Button type="submit" size="sm" disabled={isPending}>
						{isPending ? "Posting…" : "Post comment"}
					</Button>
				</div>
			</form>
		</section>
	);
}

export function CreateTaskModal({ projectId }: { projectId: string }) {
	const open = useUIStore((state) => state.isCreateTaskOpen);
	const listId = useUIStore((state) => state.activeListId);
	const close = useUIStore((state) => state.closeCreateTask);
	if (!listId) return null;
	return (
		<Modal open={open} onClose={close} title="Create task">
			<TaskForm projectId={projectId} listId={listId} onClose={close} />
		</Modal>
	);
}

export function TaskDetailModal({
	projectId,
	canEdit,
}: {
	projectId: string;
	canEdit: boolean;
}) {
	const open = useUIStore((state) => state.isTaskDetailOpen);
	const editing = useUIStore((state) => state.isTaskDetailEditing);
	const taskId = useUIStore((state) => state.activeTaskId);
	const close = useUIStore((state) => state.closeTaskDetail);
	const setEditing = useUIStore((state) => state.setTaskDetailEditing);
	const task = useBoardStore((state) =>
		state.tasks.find((candidate) => candidate.id === taskId),
	);
	const removeTask = useBoardStore((state) => state.removeTask);
	const [isDeleting, startTransition] = useTransition();
	const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	if (!task) return null;

	const deleteTask = () => {
		startTransition(async () => {
			const result = await deleteTaskAction(projectId, task.id);
			if (result.success) {
				removeTask(task.id);
				setDeleteConfirmationOpen(false);
				close();
			} else setDeleteError(result.message);
		});
	};

	return (
		<>
			<Modal
				open={open}
				onClose={close}
				title="Task details"
				className="max-w-5xl"
			>
				<div className="grid max-h-[75vh] gap-6 overflow-y-auto lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)] lg:overflow-hidden">
					<section className="min-w-0 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
						{editing && canEdit ? (
							<TaskForm
								projectId={projectId}
								listId={task.listId}
								task={task}
								onClose={() => setEditing(false)}
								onDelete={() => {
									setDeleteError("");
									setDeleteConfirmationOpen(true);
								}}
							/>
						) : (
							<TaskDetailsView
								task={task}
								canEdit={canEdit}
								onEdit={() => setEditing(true)}
							/>
						)}
					</section>
					<Comments projectId={projectId} task={task} />
				</div>
			</Modal>
			<ConfirmationModal
				open={deleteConfirmationOpen}
				onClose={() => {
					if (!isDeleting) setDeleteConfirmationOpen(false);
				}}
				onConfirm={deleteTask}
				title="Delete task?"
				confirmLabel="Delete task"
				pending={isDeleting}
				error={deleteError}
			>
				<p>
					Deleting <strong>{task.title}</strong> will permanently remove the
					task and its comments.
				</p>
			</ConfirmationModal>
		</>
	);
}
