import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Flowora",
		template: "%s · Flowora",
	},
	description:
		"A colorful, focused Kanban workspace for planning projects and shipping work together.",
};

const themeScript = `
(() => {
	try {
		const savedTheme =
			localStorage.getItem("flowora-theme") ||
			localStorage.getItem("projectflow-theme");

		const isDark = savedTheme
			? savedTheme === "dark"
			: window.matchMedia("(prefers-color-scheme: dark)").matches;

		document.documentElement.classList.toggle("dark", isDark);
		document.documentElement.style.colorScheme = isDark
			? "dark"
			: "light";
	} catch {}
})();
`;

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<ClerkProvider>
			<html lang="en" suppressHydrationWarning>
				<head>
					<Script id="flowora-theme-init" strategy="beforeInteractive">
						{themeScript}
					</Script>
				</head>

				<body>
					<ThemeProvider>{children}</ThemeProvider>
					<Analytics />
				</body>
			</html>
		</ClerkProvider>
	);
}
