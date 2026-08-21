import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireDbUser } from "@/lib/auth";
import { getCalendarTasks } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Calendar",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(value: number) {
	return String(value).padStart(2, "0");
}

function dateKey(year: number, month: number, day: number) {
	return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function monthKey(year: number, month: number) {
	return `${year}-${pad(month + 1)}`;
}

function parseMonth(value?: string) {
	const now = new Date();

	if (!value) {
		return {
			year: now.getFullYear(),
			month: now.getMonth(),
		};
	}

	const match = /^(\d{4})-(\d{2})$/.exec(value);

	if (!match) {
		return {
			year: now.getFullYear(),
			month: now.getMonth(),
		};
	}

	const year = Number(match[1]);
	const month = Number(match[2]) - 1;

	if (month < 0 || month > 11) {
		return {
			year: now.getFullYear(),
			month: now.getMonth(),
		};
	}

	return {
		year,
		month,
	};
}

function getAdjacentMonth(year: number, month: number, offset: number) {
	const date = new Date(year, month + offset, 1);

	return {
		year: date.getFullYear(),
		month: date.getMonth(),
	};
}

function getPriorityClasses(priority: string) {
	switch (priority) {
		case "high":
			return "border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300";

		case "medium":
			return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";

		case "low":
			return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300";

		default:
			return "border-french_gray-300 bg-platinum-700 text-paynes_gray-500 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-french_gray-400";
	}
}

export default async function CalendarPage({
	searchParams,
}: {
	searchParams: Promise<{
		month?: string;
	}>;
}) {
	const user = await requireDbUser();
	const params = await searchParams;

	const tasks = (await getCalendarTasks(user.id)).filter(
		(task) => task.dueDate,
	);

	const { year, month } = parseMonth(params.month);

	const firstDay = new Date(year, month, 1);
	const firstWeekday = firstDay.getDay();

	const previousMonth = getAdjacentMonth(year, month, -1);

	const nextMonth = getAdjacentMonth(year, month, 1);

	/*
	 * Use 42 cells so the calendar always displays
	 * a consistent 6-week month view.
	 */
	const calendarDays = Array.from({ length: 42 }, (_, index) => {
		const date = new Date(year, month, index - firstWeekday + 1);

		return {
			year: date.getFullYear(),
			month: date.getMonth(),
			day: date.getDate(),
			isCurrentMonth: date.getMonth() === month && date.getFullYear() === year,
		};
	});

	const taskGroups = new Map<string, typeof tasks>();

	for (const task of tasks) {
		if (!task.dueDate) continue;

		const key = task.dueDate.slice(0, 10);

		taskGroups.set(key, [...(taskGroups.get(key) ?? []), task]);
	}

	const today = new Date();

	const todayKey = dateKey(
		today.getFullYear(),
		today.getMonth(),
		today.getDate(),
	);

	const monthTitle = new Intl.DateTimeFormat("en-US", {
		month: "long",
		year: "numeric",
	}).format(firstDay);

	return (
		<div className="min-w-0 space-y-6">
			{/* Header */}
			<header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="flex items-center gap-2 text-2xl font-bold text-outer_space-900 sm:text-3xl dark:text-platinum-50">
						<CalendarDays size={28} className="text-blue_munsell-500" />
						Calendar
					</h1>

					<p className="mt-2 text-sm text-paynes_gray-500 sm:text-base dark:text-french_gray-400">
						Due dates for projects you own and tasks assigned to you.
					</p>
				</div>
			</header>

			{/* Calendar */}
			<div className="overflow-hidden rounded-xl border border-french_gray-300 bg-white dark:border-paynes_gray-400 dark:bg-outer_space-500">
				{/* Calendar Toolbar */}
				<div className="flex flex-col gap-3 border-b border-french_gray-300 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-paynes_gray-400">
					<div className="flex items-center justify-between gap-3 sm:justify-start">
						<h2 className="text-xl font-bold text-outer_space-900 dark:text-platinum-50">
							{monthTitle}
						</h2>

						<Link
							href={`/calendar?month=${monthKey(
								today.getFullYear(),
								today.getMonth(),
							)}`}
							className="sm:hidden"
						>
							<Button variant="secondary" size="sm">
								Today
							</Button>
						</Link>
					</div>

					<div className="flex items-center gap-2">
						<Link
							href={`/calendar?month=${monthKey(
								today.getFullYear(),
								today.getMonth(),
							)}`}
							className="hidden sm:block"
						>
							<Button variant="secondary" size="sm">
								Today
							</Button>
						</Link>

						<Link
							href={`/calendar?month=${monthKey(
								previousMonth.year,
								previousMonth.month,
							)}`}
						>
							<Button
								variant="secondary"
								size="icon"
								aria-label="Previous month"
							>
								<ChevronLeft size={18} />
							</Button>
						</Link>

						<Link
							href={`/calendar?month=${monthKey(
								nextMonth.year,
								nextMonth.month,
							)}`}
						>
							<Button variant="secondary" size="icon" aria-label="Next month">
								<ChevronRight size={18} />
							</Button>
						</Link>
					</div>
				</div>

				{/* Horizontal scrolling on small screens */}
				<div className="overflow-x-auto">
					<div className="min-w-190">
						{/* Weekday Header */}
						<div className="grid grid-cols-7 border-b border-french_gray-300 dark:border-paynes_gray-400">
							{WEEKDAYS.map((day) => (
								<div
									key={day}
									className="border-r border-french_gray-300 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-paynes_gray-500 last:border-r-0 dark:border-paynes_gray-400 dark:text-french_gray-400"
								>
									{day}
								</div>
							))}
						</div>

						{/* Month Grid */}
						<div className="grid grid-cols-7">
							{calendarDays.map((calendarDay) => {
								const key = dateKey(
									calendarDay.year,
									calendarDay.month,
									calendarDay.day,
								);

								const dayTasks = taskGroups.get(key) ?? [];

								const isToday = key === todayKey;

								return (
									<div
										key={key}
										className={cn(
											"min-h-32 border-b border-r border-french_gray-300 p-2 transition-colors dark:border-paynes_gray-400",
											calendarDay.isCurrentMonth
												? "bg-white dark:bg-outer_space-500"
												: "bg-platinum-700/40 dark:bg-outer_space-600/50",
											"hover:bg-platinum-700/60 dark:hover:bg-outer_space-400/70",
										)}
									>
										{/* Date */}
										<div className="mb-2 flex items-center justify-between">
											<span
												className={cn(
													"flex size-7 items-center justify-center rounded-full text-sm font-medium",
													!calendarDay.isCurrentMonth &&
														"text-french_gray-400 dark:text-paynes_gray-400",
													calendarDay.isCurrentMonth &&
														!isToday &&
														"text-outer_space-500 dark:text-platinum-500",
													isToday &&
														"bg-blue_munsell-500 font-semibold text-white",
												)}
											>
												{calendarDay.day}
											</span>

											{dayTasks.length > 0 ? (
												<span className="text-[10px] text-paynes_gray-500 dark:text-french_gray-400">
													{dayTasks.length}{" "}
													{dayTasks.length === 1 ? "task" : "tasks"}
												</span>
											) : null}
										</div>

										{/* Tasks */}
										<div className="space-y-1.5">
											{dayTasks.slice(0, 3).map((task) => (
												<Link
													key={task.id}
													href={`/projects/${task.projectId}`}
													className={cn(
														"block rounded-md border px-2 py-1.5 transition-opacity hover:opacity-80",
														getPriorityClasses(task.priority),
													)}
													title={`${task.title} — ${task.projectName}`}
												>
													<p className="truncate text-xs font-semibold">
														{task.title}
													</p>

													<p className="mt-0.5 truncate text-[10px] opacity-70">
														{task.projectName}
													</p>
												</Link>
											))}

											{dayTasks.length > 3 ? (
												<p className="px-1 text-[11px] font-medium text-paynes_gray-500 dark:text-french_gray-400">
													+{dayTasks.length - 3} more
												</p>
											) : null}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>

			{/* Priority Legend */}
			<div className="flex flex-wrap items-center gap-3 text-xs text-paynes_gray-500 dark:text-french_gray-400">
				<span className="font-medium">Priority:</span>

				<Badge className="border-red-300 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
					High
				</Badge>

				<Badge className="border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
					Medium
				</Badge>

				<Badge className="border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
					Low
				</Badge>
			</div>
		</div>
	);
}
