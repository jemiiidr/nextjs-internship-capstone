"use client";

import { MessageSquare, Trash2 } from "lucide-react";
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
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeDate } from "@/lib/utils";
import { useBoardStore } from "@/stores/board-store";
import { useUIStore } from "@/stores/ui-store";
import type { ActionResult, BoardTask, TaskComment } from "@/types";

const initialTaskState: ActionResult<BoardTask> = {
	success: false,
	message: "",
};

function TaskForm({
	projectId,
	listId,
	task,
	onClose,
}: {
	projectId: string;
	listId: string;
	task?: BoardTask;
	onClose: () => void;
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
					<select
						id={`${task?.id ?? "new"}-priority`}
						name="priority"
						defaultValue={task?.priority ?? "medium"}
						className="h-10 w-full rounded-lg border border-french_gray-300 bg-white px-3 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
					>
						<option value="low">Low</option>
						<option value="medium">Medium</option>
						<option value="high">High</option>
					</select>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`${task?.id ?? "new"}-due`}>Due date</Label>
					<Input
						id={`${task?.id ?? "new"}-due`}
						name="dueDate"
						type="date"
						defaultValue={task?.dueDate?.slice(0, 10)}
					/>
				</div>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-assignee`}>Assignee</Label>
				<select
					id={`${task?.id ?? "new"}-assignee`}
					name="assigneeId"
					defaultValue={task?.assigneeId ?? ""}
					className="h-10 w-full rounded-lg border border-french_gray-300 bg-white px-3 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
				>
					<option value="">Unassigned</option>
					{members.map((member) => (
						<option key={member.user.id} value={member.user.id}>
							{member.user.name} · {member.role}
						</option>
					))}
				</select>
			</div>
			<div className="space-y-1.5">
				<Label htmlFor={`${task?.id ?? "new"}-labels`}>Labels</Label>
				<Input
					id={`${task?.id ?? "new"}-labels`}
					name="labels"
					defaultValue={task?.labels.join(", ")}
					placeholder="frontend, bug, urgent"
					maxLength={300}
				/>
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
				<Button type="submit" disabled={pending}>
					{pending ? "Saving…" : task ? "Save task" : "Create task"}
				</Button>
			</div>
		</form>
	);
}

function Comments({ projectId, task }: { projectId: string; task: BoardTask }) {
	const [comments, setComments] = useState<TaskComment[]>([]);
	const [message, setMessage] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		let active = true;
		startTransition(async () => {
			const result = await getTaskCommentsAction(projectId, task.id);
			if (active && result.success) setComments(result.data ?? []);
		});
		return () => {
			active = false;
		};
	}, [projectId, task.id]);

	const submitComment = (formData: FormData) => {
		startTransition(async () => {
			const result = await addCommentAction(formData);
			setMessage(result.message);
			if (result.success && result.data)
				setComments((items) => [...items, result.data as TaskComment]);
		});
	};

	return (
		<section className="mt-6 border-t border-french_gray-300 pt-5 dark:border-paynes_gray-400">
			<h3 className="mb-3 flex items-center gap-2 font-semibold text-outer_space-500 dark:text-platinum-500">
				<MessageSquare size={17} /> Comments ({comments.length})
			</h3>
			<div className="max-h-52 space-y-3 overflow-y-auto pr-1">
				{comments.length === 0 ? (
					<p className="text-sm text-paynes_gray-500 dark:text-french_gray-400">
						No comments yet.
					</p>
				) : (
					comments.map((comment) => (
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
	if (!task) return null;

	const deleteTask = () => {
		if (!window.confirm(`Delete “${task.title}”?`)) return;
		startTransition(async () => {
			const result = await deleteTaskAction(projectId, task.id);
			if (result.success) {
				removeTask(task.id);
				close();
			} else window.alert(result.message);
		});
	};

	return (
		<Modal
			open={open}
			onClose={close}
			title="Task details"
			className="max-w-2xl"
		>
			<TaskForm
				projectId={projectId}
				listId={task.listId}
				task={task}
				onClose={close}
			/>
			<Comments projectId={projectId} task={task} />
			<div className="mt-5 border-t border-french_gray-300 pt-4 text-right dark:border-paynes_gray-400">
				<Button
					variant="danger"
					size="sm"
					disabled={isDeleting}
					onClick={deleteTask}
				>
					<Trash2 size={14} />
					{isDeleting ? "Deleting…" : "Delete task"}
				</Button>
			</div>
		</Modal>
	);
}
