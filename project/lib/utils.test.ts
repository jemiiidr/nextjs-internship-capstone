import { afterEach, describe, expect, it, vi } from "vitest";
import {
	decodeLabel,
	encodeLabel,
	formatDate,
	formatRelativeDate,
	initials,
	parseLabels,
	parsePositiveInteger,
	toDateOrNull,
	toTaskDeadlineOrNull,
} from "./utils";

describe("date formatting", () => {
	afterEach(() => vi.useRealTimers());

	it("handles absent and invalid dates without throwing", () => {
		expect(formatDate(null)).toBe("No due date");
		expect(formatDate("not-a-date")).toBe("Invalid date");
		expect(formatRelativeDate("not-a-date")).toBe("Invalid date");
	});

	it("does not silently roll impossible calendar dates forward", () => {
		expect(toDateOrNull("2025-02-29")).toBeNull();
		expect(toDateOrNull("2024-02-29")?.toISOString()).toBe(
			"2024-02-29T12:00:00.000Z",
		);
		expect(toDateOrNull("2024-13-01")).toBeNull();
		expect(toDateOrNull("anything else")).toBeNull();
	});

	it("stores task deadline times and defaults to end of day", () => {
		expect(toTaskDeadlineOrNull("2026-08-25", undefined)?.toISOString()).toBe(
			"2026-08-25T23:59:00.000Z",
		);
		expect(toTaskDeadlineOrNull("2026-08-25", "14:30")?.toISOString()).toBe(
			"2026-08-25T14:30:00.000Z",
		);
		expect(toTaskDeadlineOrNull("2026-08-25", "25:00")).toBeNull();
	});

	it("formats relative boundaries predictably", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-08-25T12:00:00Z"));
		expect(formatRelativeDate("2026-08-25T11:59:31Z")).toBe("just now");
		expect(formatRelativeDate("2026-08-25T11:00:00Z")).toBe("1 hour ago");
		expect(formatRelativeDate("2026-08-26T12:00:00Z")).toBe("tomorrow");
	});
});

describe("display helpers", () => {
	it("strictly parses positive query integers and caps large values", () => {
		expect(parsePositiveInteger("2", 1)).toBe(2);
		expect(parsePositiveInteger("2abc", 1)).toBe(1);
		expect(parsePositiveInteger("0", 1)).toBe(1);
		expect(parsePositiveInteger("999999999999999999999", 1, 100)).toBe(1);
		expect(parsePositiveInteger("101", 1, 100)).toBe(100);
	});

	it("creates safe initials for whitespace and long names", () => {
		expect(initials("  Jamie   Lee  ")).toBe("JL");
		expect(initials("   ")).toBe("");
		expect(initials("Jamie Mae Lee")).toBe("JM");
	});

	it("deduplicates, trims, and limits labels", () => {
		expect(parseLabels(" alpha, beta,alpha, , gamma ")).toEqual([
			"alpha",
			"beta",
			"gamma",
		]);
		expect(parseLabels("1,2,3,4,5,6,7,8,9")).toHaveLength(8);
	});

	it("round-trips encoded labels and strips delimiter commas", () => {
		const encoded = encodeLabel("UX, review", "#2563eb");
		expect(encoded).toBe("[#2563eb]UX  review");
		expect(decodeLabel(encoded)).toEqual({
			color: "#2563eb",
			name: "UX  review",
		});
		expect(decodeLabel("Plain").name).toBe("Plain");
	});
});
