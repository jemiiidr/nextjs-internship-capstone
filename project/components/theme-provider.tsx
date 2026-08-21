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

interface ThemeContextValue {
	theme: Theme;
	setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("light");

	useEffect(() => {
		const currentTheme: Theme = document.documentElement.classList.contains(
			"dark",
		)
			? "dark"
			: "light";

		setThemeState(currentTheme);
	}, []);

	const setTheme = useCallback((nextTheme: Theme) => {
		document.documentElement.classList.toggle("dark", nextTheme === "dark");

		document.documentElement.style.colorScheme = nextTheme;

		localStorage.setItem("flowora-theme", nextTheme);

		setThemeState(nextTheme);
	}, []);

	const value = useMemo(
		() => ({
			theme,
			setTheme,
		}),
		[theme, setTheme],
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
