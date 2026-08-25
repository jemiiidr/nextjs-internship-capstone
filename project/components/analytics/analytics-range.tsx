"use client";

import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const OPTIONS = [7, 14, 30, 90];

export function AnalyticsRange({ days }: { days: number }) {
	const router = useRouter();
	const ref = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);
	useEffect(() => {
		if (!open) return;
		const close = (event: PointerEvent) => {
			if (!ref.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);
	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="flex h-10 items-center gap-2 rounded-xl border border-french_gray-300 bg-white px-4 text-sm font-medium shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-400"
			>
				<CalendarDays size={15} /> Last {days} days <ChevronDown size={14} />
			</button>
			{open ? (
				<div className="absolute right-0 top-[calc(100%+7px)] z-50 w-44 rounded-xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-700 dark:bg-outer_space-400">
					{OPTIONS.map((option) => (
						<button
							key={option}
							type="button"
							onClick={() => {
								setOpen(false);
								router.push(`/analytics?days=${option}`);
							}}
							className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-platinum-100 dark:hover:bg-outer_space-300"
						>
							<span>Last {option} days</span>
							{days === option ? (
								<Check size={14} className="text-blue_munsell-500" />
							) : null}
						</button>
					))}
				</div>
			) : null}
		</div>
	);
}
