"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	CalendarDays,
	CheckSquare,
	GripVertical,
	MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { BoardTask } from "@/types";

const priorityClasses: Record<BoardTask["priority"], string> = {
	low: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
	medium:
		"border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
	high: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export function TaskCard({
	task,
	disabled = false,
}: {
	task: BoardTask;
	disabled?: boolean;
}) {
	const openTaskDetail = useUIStore((state) => state.openTaskDetail);
	const selectedTaskIds = useUIStore((state) => state.selectedTaskIds);
	const toggleTaskSelection = useUIStore((state) => state.toggleTaskSelection);
	const selected = selectedTaskIds.includes(task.id);
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id, disabled });

	return (
		<article
			ref={setNodeRef}
			style={{ transform: CSS.Transform.toString(transform), transition }}
			className={cn(
				"group rounded-xl border border-french_gray-300 bg-white p-3 shadow-sm transition hover:border-blue_munsell-500 hover:shadow-md dark:border-paynes_gray-400 dark:bg-outer_space-400",
				isDragging && "z-20 opacity-60 shadow-xl",
				selected && "ring-2 ring-blue_munsell-500",
			)}
		>
			<div className="mb-2 flex items-start gap-2">
				<button
					type="button"
					aria-label="Drag task"
					className="mt-0.5 cursor-grab touch-none text-french_gray-500 hover:text-paynes_gray-500 active:cursor-grabbing"
					{...attributes}
					{...listeners}
				>
					<GripVertical size={16} />
				</button>
				<button
					type="button"
					className="min-w-0 flex-1 text-left"
					onClick={() => openTaskDetail(task.id)}
				>
					<h4 className="break-words text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
						{task.title}
					</h4>
					{task.description ? (
						<p className="mt-1 line-clamp-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
							{task.description}
						</p>
					) : null}
				</button>
				<label
					className="flex cursor-pointer items-center"
					title="Select for bulk action"
				>
					<input
						type="checkbox"
						checked={selected}
						onChange={() => toggleTaskSelection(task.id)}
						className="size-4 accent-blue_munsell-500"
					/>
					<span className="sr-only">Select {task.title}</span>
				</label>
			</div>
			{task.labels.length > 0 ? (
				<div className="mb-3 flex flex-wrap gap-1">
					{task.labels.slice(0, 3).map((label) => (
						<Badge key={label}>{label}</Badge>
					))}
				</div>
			) : null}
			<div className="flex items-end justify-between gap-2">
				<div className="space-y-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
					<Badge className={cn("capitalize", priorityClasses[task.priority])}>
						{task.priority}
					</Badge>
					{task.dueDate ? (
						<span className="flex items-center gap-1">
							<CalendarDays size={12} />{" "}
							{formatDate(task.dueDate, { year: undefined })}
						</span>
					) : null}
				</div>
				<div className="flex items-center gap-2">
					{task.commentsCount > 0 ? (
						<span className="flex items-center gap-1 text-xs text-paynes_gray-500">
							<MessageSquare size={13} />
							{task.commentsCount}
						</span>
					) : (
						<CheckSquare size={14} className="text-french_gray-500" />
					)}
					{task.assignee ? (
						<Avatar
							name={task.assignee.name}
							src={task.assignee.avatarUrl}
							className="size-7"
						/>
					) : null}
				</div>
			</div>
		</article>
	);
}
