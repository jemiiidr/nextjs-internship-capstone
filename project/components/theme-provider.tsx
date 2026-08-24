"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

type Theme = "dark" | "light";
const DEFAULT_ACCENT_COLOR = "#7467f0";

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	accentColor: string;
	setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("light");
	const [accentColor, setAccentColorState] = useState(DEFAULT_ACCENT_COLOR);

	useEffect(() => {
		const currentTheme: Theme = document.documentElement.classList.contains(
			"dark",
		)
			? "dark"
			: "light";

		setThemeState(currentTheme);
		const savedAccent = localStorage.getItem("flowora-accent-color");
		if (savedAccent && /^#[0-9a-f]{6}$/i.test(savedAccent)) {
			document.documentElement.style.setProperty("--brand-color", savedAccent);
			setAccentColorState(savedAccent);
		}
	}, []);

	const setTheme = useCallback((nextTheme: Theme) => {
		document.documentElement.classList.toggle("dark", nextTheme === "dark");

		document.documentElement.style.colorScheme = nextTheme;

		localStorage.setItem("flowora-theme", nextTheme);

		setThemeState(nextTheme);
	}, []);

	const setAccentColor = useCallback((color: string) => {
		if (!/^#[0-9a-f]{6}$/i.test(color)) return;
		document.documentElement.style.setProperty("--brand-color", color);
		localStorage.setItem("flowora-accent-color", color);
		setAccentColorState(color);
	}, []);

	const value = useMemo(
		() => ({
			theme,
			setTheme,
			accentColor,
			setAccentColor,
		}),
		[theme, setTheme, accentColor, setAccentColor],
	);

	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within ThemeProvider");
	}

	return context;
}
