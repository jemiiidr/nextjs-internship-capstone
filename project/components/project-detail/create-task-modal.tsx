"use client";

import { ChevronLeft, ChevronRight, MessageSquare, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { DeadlineInput } from "@/components/ui/deadline-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeDate } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import type { ActionResult, BoardTask, TaskComment } from "@/types";

const initialTaskState: ActionResult<BoardTask> = {
	success: false,
	message: "",
};

const COMMENTS_PER_PAGE = 5;

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
			<input type="hidden" name="listId" value={listId} />
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
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-description`}>Description</Label>
				<Textarea
					id={`${task?.id ?? "new"}-description`}
					name="description"
					defaultValue={task?.description ?? ""}
					maxLength={2000}
				/>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
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
					<Label htmlFor={`${task?.id ?? "new"}-due`}>Due date</Label>
					<DeadlineInput
						id={`${task?.id ?? "new"}-due`}
						name="dueDate"
						defaultValue={task?.dueDate?.slice(0, 10)}
					/>
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
					<Button variant="danger" onClick={onDelete}>
						<Trash2 size={14} /> Delete task
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

export function TaskDetailModal({ projectId }: { projectId: string }) {
	const open = useUIStore((state) => state.isTaskDetailOpen);
	const taskId = useUIStore((state) => state.activeTaskId);
	const close = useUIStore((state) => state.closeTaskDetail);
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
						<TaskForm
							projectId={projectId}
							listId={task.listId}
							task={task}
							onClose={close}
							onDelete={() => {
								setDeleteError("");
								setDeleteConfirmationOpen(true);
							}}
						/>
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
