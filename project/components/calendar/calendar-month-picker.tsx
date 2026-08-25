"use client";

import {
	CalendarDays,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const MONTHS = Array.from({ length: 12 }, (_, month) =>
	new Date(2020, month, 1).toLocaleDateString("en-US", { month: "short" }),
);

export function CalendarMonthPicker({
	year,
	month,
}: {
	year: number;
	month: number;
}) {
	const router = useRouter();
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	const [displayYear, setDisplayYear] = useState(year);

	useEffect(() => {
		setDisplayYear(year);
	}, [year]);

	useEffect(() => {
		if (!open) return;
		const close = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);

	const selectMonth = (nextMonth: number) => {
		setOpen(false);
		router.push(
			`/calendar?month=${displayYear}-${String(nextMonth + 1).padStart(2, "0")}`,
		);
	};

	return (
		<div ref={rootRef} className="relative min-w-0 flex-1 sm:flex-none">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				aria-expanded={open}
				className="flex h-10 w-full items-center justify-between gap-2 rounded-xl border border-french_gray-300 bg-white px-3 text-sm font-medium text-outer_space-900 shadow-sm transition hover:border-blue_munsell-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-400 dark:border-paynes_gray-700 dark:bg-outer_space-400 dark:text-platinum-50 sm:w-48"
			>
				<span className="flex items-center gap-2">
					<CalendarDays size={15} className="text-blue_munsell-500" />
					{new Date(year, month, 1).toLocaleDateString("en-US", {
						month: "long",
						year: "numeric",
					})}
				</span>
				<ChevronDown
					size={15}
					className={cn(
						"text-paynes_gray-400 transition-transform",
						open && "rotate-180",
					)}
				/>
			</button>
			{open ? (
				<div className="absolute left-0 top-[calc(100%+8px)] z-[80] w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-french_gray-300 bg-white p-3 shadow-2xl dark:border-paynes_gray-700 dark:bg-outer_space-400">
					<div className="mb-3 flex items-center justify-between">
						<button
							type="button"
							onClick={() => setDisplayYear((value) => value - 1)}
							aria-label="Previous year"
							className="grid size-8 place-items-center rounded-lg text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300"
						>
							<ChevronLeft size={16} />
						</button>
						<strong className="text-sm text-outer_space-900 dark:text-platinum-50">
							{displayYear}
						</strong>
						<button
							type="button"
							onClick={() => setDisplayYear((value) => value + 1)}
							aria-label="Next year"
							className="grid size-8 place-items-center rounded-lg text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300"
						>
							<ChevronRight size={16} />
						</button>
					</div>
					<div className="grid grid-cols-3 gap-1">
						{MONTHS.map((label, index) => {
							const selected = displayYear === year && index === month;
							return (
								<button
									key={label}
									type="button"
									onClick={() => selectMonth(index)}
									className={cn(
										"rounded-lg px-2 py-2.5 text-sm transition-colors",
										selected
											? "bg-blue_munsell-500 font-semibold text-white"
											: "text-paynes_gray-600 hover:bg-platinum-100 hover:text-outer_space-900 dark:text-french_gray-300 dark:hover:bg-outer_space-300 dark:hover:text-platinum-50",
									)}
								>
									{label}
								</button>
							);
						})}
					</div>
					<button
						type="button"
						onClick={() => {
							const today = new Date();
							setOpen(false);
							router.push(
								`/calendar?month=${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`,
							);
						}}
						className="mt-3 w-full rounded-lg border-t border-french_gray-200 px-3 pt-3 text-sm font-medium text-blue_munsell-600 dark:border-paynes_gray-700 dark:text-blue_munsell-300"
					>
						Jump to current month
					</button>
				</div>
			) : null}
		</div>
	);
}
