"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const nextTheme = theme === "light" ? "dark" : "light";
	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setTheme(nextTheme)}
			aria-label={`Switch to ${nextTheme} theme`}
		>
			{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
		</Button>
	);
}
