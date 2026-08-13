import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: { default: "ProjectFlow", template: "%s · ProjectFlow" },
	description:
		"A collaborative Kanban project management application built with Next.js, Clerk, Drizzle, and Neon.",
};

const themeScript = `(() => { try { const saved = localStorage.getItem('projectflow-theme'); const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.toggle('dark', dark); document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; } catch {} })();`;

export default function RootLayout({
	children,
}: Readonly<{ children: ReactNode }>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<head>
					<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				</head>
				<body>
					<ThemeProvider>{children}</ThemeProvider>
					<Analytics />
				</body>
			</html>
		</ClerkProvider>
	);
}
