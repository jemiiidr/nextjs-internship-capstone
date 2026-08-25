"use client";

import {
	CalendarDays,
	ExternalLink,
	FolderKanban,
	ListTodo,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import type { TaskPriority } from "@/types";

interface CalendarTask {
	id: string;
	title: string;
	description: string | null;
	priority: TaskPriority;
	dueDate: string | null;
	projectId: string;
	projectName: string;
	listName: string;
}

function taskTone(priority: TaskPriority) {
	if (priority === "high")
		return "bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70";
	if (priority === "medium")
		return "bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200 dark:hover:bg-amber-950/70";
	return "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70";
}

function readableDate(dateKey: string) {
	return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
		weekday: "long",
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

export function CalendarDayTasks({
	tasks,
	date,
	maxVisible = 2,
	compactOnMobile = false,
}: {
	tasks: CalendarTask[];
	date: string;
	maxVisible?: number;
	compactOnMobile?: boolean;
}) {
	const [allOpen, setAllOpen] = useState(false);
	const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);

	const showTask = (task: CalendarTask) => {
		setAllOpen(false);
		setSelectedTask(task);
	};

	return (
		<>
			{compactOnMobile && tasks.length > 0 ? (
				<button
					type="button"
					onClick={() =>
						tasks.length === 1 ? showTask(tasks[0]) : setAllOpen(true)
					}
					aria-label={`${tasks.length} deadline${tasks.length === 1 ? "" : "s"} on ${readableDate(date)}`}
					className="mt-1 flex w-full flex-col items-center gap-1 rounded-md py-1 text-[9px] font-semibold text-blue_munsell-600 transition-colors hover:bg-blue_munsell-50 dark:text-blue_munsell-300 dark:hover:bg-blue_munsell-950/30 sm:hidden"
				>
					<span>{tasks.length} due</span>
					<span className="flex max-w-full gap-0.5" aria-hidden="true">
						{tasks.slice(0, 3).map((task) => (
							<i
								key={task.id}
								className={cn(
									"size-1.5 rounded-full",
									task.priority === "high"
										? "bg-rose-500"
										: task.priority === "medium"
											? "bg-amber-500"
											: "bg-emerald-500",
								)}
							/>
						))}
					</span>
				</button>
			) : null}
			<div
				className={cn("mt-1 space-y-1", compactOnMobile && "hidden sm:block")}
			>
				{tasks.slice(0, maxVisible).map((task) => (
					<button
						key={task.id}
						type="button"
						onClick={() => showTask(task)}
						title={`${task.title} — ${task.projectName}`}
						className={cn(
							"block w-full rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
							taskTone(task.priority),
						)}
					>
						<span className="block truncate font-medium">{task.title}</span>
						<span className="block truncate opacity-70">{task.listName}</span>
					</button>
				))}
				{tasks.length > maxVisible ? (
					<button
						type="button"
						onClick={() => setAllOpen(true)}
						className="rounded-md px-1.5 py-1 text-[10px] font-semibold text-paynes_gray-500 transition-colors hover:bg-platinum-200 hover:text-outer_space-900 dark:text-french_gray-400 dark:hover:bg-outer_space-300 dark:hover:text-platinum-50"
					>
						+{tasks.length - maxVisible} more
					</button>
				) : null}
			</div>

			<Modal
				open={allOpen}
				onClose={() => setAllOpen(false)}
				title={`Deadlines for ${readableDate(date)}`}
				description={`${tasks.length} task${tasks.length === 1 ? "" : "s"} due on this day.`}
				className="max-w-xl"
			>
				<div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1 scrollbar-thin">
					{tasks.map((task) => (
						<button
							key={task.id}
							type="button"
							onClick={() => showTask(task)}
							className="flex w-full items-center gap-3 rounded-xl border border-french_gray-200 p-3 text-left transition-colors hover:border-blue_munsell-300 hover:bg-blue_munsell-50/40 dark:border-paynes_gray-700 dark:hover:border-blue_munsell-700 dark:hover:bg-blue_munsell-950/20"
						>
							<span
								className={cn(
									"size-2.5 shrink-0 rounded-full",
									task.priority === "high"
										? "bg-rose-500"
										: task.priority === "medium"
											? "bg-amber-500"
											: "bg-emerald-500",
								)}
							/>
							<span className="min-w-0 flex-1">
								<span className="block truncate text-sm font-semibold">
									{task.title}
								</span>
								<span className="block truncate text-xs text-paynes_gray-500">
									{task.projectName} · {task.listName}
								</span>
							</span>
						</button>
					))}
				</div>
			</Modal>

			<Modal
				open={selectedTask !== null}
				onClose={() => setSelectedTask(null)}
				title={selectedTask?.title ?? "Task deadline"}
				description="Task deadline details"
				className="max-w-lg"
			>
				{selectedTask ? (
					<div className="space-y-5">
						{selectedTask.description ? (
							<p className="whitespace-pre-wrap text-sm leading-6 text-paynes_gray-600 dark:text-french_gray-300">
								{selectedTask.description}
							</p>
						) : null}
						<div className="grid gap-3 rounded-xl border border-french_gray-200 bg-platinum-50/50 p-4 text-sm dark:border-paynes_gray-700 dark:bg-outer_space-400">
							<p className="flex items-center gap-2">
								<FolderKanban size={16} className="text-blue_munsell-500" />
								<span className="text-paynes_gray-500">Project</span>
								<strong className="ml-auto">{selectedTask.projectName}</strong>
							</p>
							<p className="flex items-center gap-2">
								<ListTodo size={16} className="text-blue_munsell-500" />
								<span className="text-paynes_gray-500">Status</span>
								<strong className="ml-auto">{selectedTask.listName}</strong>
							</p>
							<p className="flex items-center gap-2">
								<CalendarDays size={16} className="text-blue_munsell-500" />
								<span className="text-paynes_gray-500">Due date</span>
								<strong className="ml-auto">{readableDate(date)}</strong>
							</p>
							<p className="flex items-center gap-2">
								<span
									className={cn(
										"size-2.5 rounded-full",
										selectedTask.priority === "high"
											? "bg-rose-500"
											: selectedTask.priority === "medium"
												? "bg-amber-500"
												: "bg-emerald-500",
									)}
								/>
								<span className="text-paynes_gray-500">Priority</span>
								<strong className="ml-auto capitalize">
									{selectedTask.priority}
								</strong>
							</p>
						</div>
						<div className="flex justify-end">
							<Link
								href={`/projects/${selectedTask.projectId}`}
								className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue_munsell-500 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-blue_munsell-600"
							>
								<ExternalLink size={15} /> Open project
							</Link>
						</div>
					</div>
				) : null}
			</Modal>
		</>
	);
}
