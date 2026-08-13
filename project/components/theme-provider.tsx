"use client";

import {
	createContext,
	type ReactNode,
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
		const current = document.documentElement.classList.contains("dark")
			? "dark"
			: "light";
		setThemeState(current);
	}, []);

	const setTheme = (nextTheme: Theme) => {
		document.documentElement.classList.toggle("dark", nextTheme === "dark");
		document.documentElement.style.colorScheme = nextTheme;
		localStorage.setItem("projectflow-theme", nextTheme);
		setThemeState(nextTheme);
	};

	const value = useMemo(() => ({ theme, setTheme }), [theme]);
	return (
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);
	if (!context) throw new Error("useTheme must be used within ThemeProvider");
	return context;
}
