"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
	const { theme, setTheme } = useTheme();
	const nextTheme = theme === "light" ? "dark" : "light";
	return (
		<Button
			variant="ghost"
			size={compact ? "icon" : "default"}
			className={cn(!compact && "w-full justify-start px-3")}
			onClick={() => setTheme(nextTheme)}
			aria-label={`Switch to ${nextTheme} theme`}
		>
			{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
			{compact ? null : (
				<span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
			)}
		</Button>
	);
}

const accentPresets = ["#7467f0", "#2563eb", "#0891b2", "#059669", "#ea580c", "#e11d48"];

export function AccentColorPicker() {
	const { accentColor, setAccentColor } = useTheme();

	return (
		<div className="space-y-3">
			<p className="text-sm font-medium text-outer_space-900 dark:text-platinum-50">
				Accent color
			</p>
			<div className="flex flex-wrap items-center gap-3">
				{accentPresets.map((color) => (
					<button
						type="button"
						key={color}
						onClick={() => setAccentColor(color)}
						className="size-9 rounded-full border-2 border-white shadow-sm ring-offset-2 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 dark:border-outer_space-400"
						style={{ backgroundColor: color, boxShadow: accentColor === color ? `0 0 0 3px ${color}` : undefined }}
						aria-label={`Use ${color} as the accent color`}
						aria-pressed={accentColor === color}
					/>
				))}
				<label className="flex items-center gap-2 rounded-xl border border-french_gray-300 px-3 py-2 text-sm dark:border-paynes_gray-700">
					<span>Custom</span>
					<input
						type="color"
						value={accentColor}
						onChange={(event) => setAccentColor(event.target.value)}
						className="size-6 cursor-pointer border-0 bg-transparent p-0"
						aria-label="Choose a custom accent color"
					/>
				</label>
			</div>
			<p className="text-xs text-paynes_gray-500">
				Applied to buttons, highlighted text, links, focus rings, and selected states throughout Kanvas.
			</p>
		</div>
	);
}
