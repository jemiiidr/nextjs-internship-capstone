"use client";

import { AlertTriangle } from "lucide-react";
import { type InputHTMLAttributes, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

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
			<Input
				{...props}
				id={id}
				type="date"
				value={value}
				onChange={(event) => {
					setValue(event.target.value);
					onChange?.(event);
				}}
				aria-describedby={isPastDue ? warningId : props["aria-describedby"]}
			/>
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
