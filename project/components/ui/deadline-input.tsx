"use client";

import { AlertTriangle, CalendarDays } from "lucide-react";
import { type InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function localDateKey(date = new Date()) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function DeadlineInput({
	id,
	defaultValue,
	onChange,
	className,
	...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
	const initialValue = typeof defaultValue === "string" ? defaultValue : "";
	const [value, setValue] = useState(initialValue);
	const warningId = id ? `${id}-past-warning` : undefined;
	const isPastDue = /^\d{4}-\d{2}-\d{2}$/.test(value) && value < localDateKey();

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	return (
		<>
			<div className="relative">
				<Input
					{...props}
					id={id}
					type="date"
					value={value}
					className={cn(
						"relative pr-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:size-6 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0",
						className,
					)}
					onChange={(event) => {
						setValue(event.target.value);
						onChange?.(event);
					}}
					aria-describedby={isPastDue ? warningId : props["aria-describedby"]}
				/>
				<CalendarDays
					size={16}
					aria-hidden="true"
					className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-paynes_gray-500 dark:text-french_gray-400"
				/>
			</div>
			{isPastDue ? (
				<p
					id={warningId}
					role="status"
					className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300"
				>
					<AlertTriangle size={14} className="mt-px shrink-0" />
					This deadline is in the past and will be marked overdue.
				</p>
			) : null}
		</>
	);
}
