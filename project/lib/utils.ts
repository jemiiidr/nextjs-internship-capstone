import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(
	value: Date | string | null | undefined,
	options?: Intl.DateTimeFormatOptions,
) {
	if (!value) return "No due date";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "Invalid date";

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		...options,
	}).format(date);
}

export function formatRelativeDate(value: Date | string) {
	const date = value instanceof Date ? value : new Date(value);
	const difference = date.getTime() - Date.now();
	const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
	const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
		["year", 1000 * 60 * 60 * 24 * 365],
		["month", 1000 * 60 * 60 * 24 * 30],
		["week", 1000 * 60 * 60 * 24 * 7],
		["day", 1000 * 60 * 60 * 24],
		["hour", 1000 * 60 * 60],
		["minute", 1000 * 60],
	];

	for (const [unit, milliseconds] of units) {
		if (Math.abs(difference) >= milliseconds) {
			return formatter.format(Math.round(difference / milliseconds), unit);
		}
	}

	return "just now";
}

export function initials(name: string) {
	return name
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");
}

export function parseLabels(value: string | null | undefined) {
	if (!value) return [];
	return Array.from(
		new Set(
			value
				.split(",")
				.map((label) => label.trim())
				.filter(Boolean),
		),
	).slice(0, 8);
}

export function toDateOrNull(value: string | null | undefined) {
	if (!value) return null;
	const date = new Date(`${value}T12:00:00.000Z`);
	return Number.isNaN(date.getTime()) ? null : date;
}
