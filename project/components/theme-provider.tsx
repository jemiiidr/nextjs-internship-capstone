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
let themeTransitionFrame: number | null = null;
let themeReleaseFrame: number | null = null;

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
		const savedAccent =
			localStorage.getItem("kanvas-accent-color") ??
			localStorage.getItem("flowora-accent-color");
		if (savedAccent && /^#[0-9a-f]{6}$/i.test(savedAccent)) {
			document.documentElement.style.setProperty("--brand-color", savedAccent);
			setAccentColorState(savedAccent);
		}
	}, []);

	const setTheme = useCallback((nextTheme: Theme) => {
		const root = document.documentElement;
		if (themeTransitionFrame !== null)
			cancelAnimationFrame(themeTransitionFrame);
		if (themeReleaseFrame !== null) cancelAnimationFrame(themeReleaseFrame);

		root.classList.add("theme-switching");
		root.classList.toggle("dark", nextTheme === "dark");

		root.style.colorScheme = nextTheme;

		localStorage.setItem("kanvas-theme", nextTheme);

		setThemeState(nextTheme);
		themeTransitionFrame = requestAnimationFrame(() => {
			themeReleaseFrame = requestAnimationFrame(() => {
				root.classList.remove("theme-switching");
				themeTransitionFrame = null;
				themeReleaseFrame = null;
			});
		});
	}, []);

	const setAccentColor = useCallback((color: string) => {
		if (!/^#[0-9a-f]{6}$/i.test(color)) return;
		document.documentElement.style.setProperty("--brand-color", color);
		localStorage.setItem("kanvas-accent-color", color);
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
