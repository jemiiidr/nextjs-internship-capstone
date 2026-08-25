import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function parsePositiveInteger(
	value: string | undefined,
	fallback: number,
	maximum = Number.MAX_SAFE_INTEGER,
) {
	if (!value || !/^\d+$/.test(value)) return fallback;
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) return fallback;
	return Math.min(parsed, maximum);
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
	if (Number.isNaN(date.getTime())) return "Invalid date";
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

const labelPalette = [
	"#2563eb",
	"#7c3aed",
	"#0891b2",
	"#db2777",
	"#475569",
	"#4f46e5",
];

export function decodeLabel(value: string) {
	const match = value.match(/^\[(#[0-9a-f]{6})\](.+)$/i);
	if (match) return { color: match[1], name: match[2] };
	let hash = 0;
	for (const character of value)
		hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	return { color: labelPalette[hash % labelPalette.length], name: value };
}

export function encodeLabel(name: string, color: string) {
	return `[${color}]${name.replaceAll(",", " ").trim()}`;
}

export function toDateOrNull(value: string | null | undefined) {
	if (!value) return null;
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(`${value}T12:00:00.000Z`);
	if (
		Number.isNaN(date.getTime()) ||
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== month - 1 ||
		date.getUTCDate() !== day
	)
		return null;
	return date;
}
