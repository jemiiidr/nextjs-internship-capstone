"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
	CalendarDays,
	CheckSquare,
	MessageSquare,
} from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, decodeLabel, formatDate } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { BoardTask } from "@/types";

const priorityClasses: Record<BoardTask["priority"], string> = {
	low:
		"border-emerald-200 bg-emerald-50 text-emerald-700 " +
		"dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",

	medium:
		"border-amber-200 bg-amber-50 text-amber-700 " +
		"dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",

	high:
		"border-red-200 bg-red-50 text-red-700 " +
		"dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
};

/* -------------------------------------------------------------------------- */
/*                           PRESENTATIONAL CARD                              */
/* -------------------------------------------------------------------------- */

type TaskCardContentProps = {
	task: BoardTask;
	selected?: boolean;
	overlay?: boolean;
	onToggleSelection?: () => void;
	accentClass?: string;
};

export function TaskCardContent({
	task,
	selected = false,
	overlay = false,
	onToggleSelection,
	accentClass,
}: TaskCardContentProps) {
	return (
		<article
			className={cn(
				"group relative overflow-hidden rounded-xl border p-3.5",
				"border-french_gray-300 bg-white shadow-sm",
				"dark:border-paynes_gray-400 dark:bg-outer_space-400",

				/*
				 * Keep visual transitions on the inner card.
				 * The outer sortable wrapper handles movement.
				 */
				"transition-[border-color,box-shadow,background-color]",
				"duration-150 ease-out",

				!overlay && "hover:border-blue_munsell-500 hover:shadow-md",

				selected && !overlay && "ring-2 ring-blue_munsell-500",

				/*
				 * DragOverlay appearance
				 */
				overlay && [
					"scale-[1.02]",
					"border-blue_munsell-400",
					"shadow-2xl",
					"ring-1 ring-blue_munsell-500/30",
					"cursor-grabbing",
				],
			)}
		>
			<span className={cn("absolute inset-y-3 left-0 w-0.5 rounded-r-full bg-blue-500", accentClass)} />
			{/* Header */}
			<div className="mb-2 flex items-start gap-2 pl-1">
				{/* Task information */}
				<div className="min-w-0 flex-1 text-left">
					<h4 className="wrap-break-word text-sm font-semibold text-outer_space-500 dark:text-platinum-500">
						{task.title}
					</h4>

					{task.description ? (
						<p className="mt-1 line-clamp-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
							{task.description}
						</p>
					) : null}
				</div>

				{/* Bulk selection */}
				{!overlay ? (
					<label
						className="flex shrink-0 cursor-pointer items-center"
						title="Select for bulk action"
					>
						<input
							type="checkbox"
							checked={selected}
							onChange={onToggleSelection}
							onPointerDown={(event) => event.stopPropagation()}
							onClick={(event) => event.stopPropagation()}
							className="size-4 accent-blue_munsell-500"
						/>

						<span className="sr-only">Select {task.title}</span>
					</label>
				) : null}
			</div>

			{/* Labels */}
			{task.labels.length > 0 ? (
				<div className="mb-3 flex flex-wrap gap-1">
					{task.labels.slice(0, 3).map((label) => {
						const decoded = decodeLabel(label);
						return <Badge key={label} style={{ borderColor: `${decoded.color}55`, backgroundColor: `${decoded.color}18`, color: decoded.color }}>{decoded.name}</Badge>;
					})}

					{task.labels.length > 3 ? (
						<Badge>+{task.labels.length - 3}</Badge>
					) : null}
				</div>
			) : null}

			{/* Footer */}
			<div className="flex items-end justify-between gap-2">
				<div className="space-y-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
					<Badge className={cn("capitalize", priorityClasses[task.priority])}>
						{task.priority}
					</Badge>

					{task.dueDate ? (
						<span className="flex items-center gap-1">
							<CalendarDays size={12} className="shrink-0" />

							{formatDate(task.dueDate, {
								year: undefined,
							})}
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

/* -------------------------------------------------------------------------- */
/*                              SORTABLE CARD                                 */
/* -------------------------------------------------------------------------- */

export function TaskCard({
	task,
	disabled = false,
	accentClass,
}: {
	task: BoardTask;
	disabled?: boolean;
	accentClass?: string;
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
	} = useSortable({
		id: task.id,
		disabled,

		/*
		 * Faster than dnd-kit's default 250ms.
		 *
		 * This gives the other cards a snappy but
		 * smooth movement when making space.
		 */
		transition: {
			duration: 180,
			easing: "cubic-bezier(0.25, 1, 0.5, 1)",
		},
	});

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,

		/*
		 * Browser can prepare the transform layer
		 * while the card is actively moving.
		 */
		willChange: isDragging ? "transform" : undefined,
	};

	return (
		// The sortable activator cannot be a native button because the card contains a checkbox.
		// biome-ignore lint/a11y/useSemanticElements: nested interactive selection control requires a non-button activator
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			role="button"
			tabIndex={0}
			onClick={() => {
				if (!isDragging) openTaskDetail(task.id);
			}}
			onKeyDown={(event) => {
				if ((event.key === "Enter" || event.key === " ") && !isDragging) {
					event.preventDefault();
					openTaskDetail(task.id);
				}
			}}
			className={cn(
				"relative touch-none outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-500 focus-visible:ring-offset-2",
				!disabled && "cursor-grab active:cursor-grabbing",
				disabled && "cursor-pointer",

				/*
				 * Keep its physical space in the list,
				 * but hide the original while DragOverlay
				 * is displaying the floating card.
				 */
				isDragging && "z-0 opacity-20",
			)}
		>
			<TaskCardContent
				task={task}
				selected={selected}
				onToggleSelection={() => toggleTaskSelection(task.id)}
				accentClass={accentClass}
			/>
		</div>
	);
}

export function TaskCardOverlay({ task, accentClass }: { task: BoardTask; accentClass?: string }) {
	return (
		<div className="w-full">
			<TaskCardContent task={task} overlay accentClass={accentClass} />
		</div>
	);
}
