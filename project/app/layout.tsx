import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: {
		default: "Kanvas",
		template: "%s · Kanvas",
	},
	description:
		"Kanvas is the collaborative canvas for planning projects, organizing tasks, and moving work forward.",
	icons: { icon: "/logo.svg", apple: "/logo.svg" },
};

const themeScript = `
(() => {
	try {
		const savedTheme =
			localStorage.getItem("kanvas-theme") ||
			localStorage.getItem("flowora-theme") ||
			localStorage.getItem("projectflow-theme");

		const isDark = savedTheme
			? savedTheme === "dark"
			: window.matchMedia("(prefers-color-scheme: dark)").matches;

		document.documentElement.classList.toggle("dark", isDark);
		document.documentElement.style.colorScheme = isDark
			? "dark"
			: "light";

		const savedAccent = localStorage.getItem("kanvas-accent-color") || localStorage.getItem("flowora-accent-color");
		if (savedAccent && /^#[0-9a-f]{6}$/i.test(savedAccent)) {
			document.documentElement.style.setProperty("--brand-color", savedAccent);
		}
	} catch {}
})();
`;

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<ClerkProvider
			localization={{
				signIn: {
					start: {
						title: "Sign in to Kanvas",
						titleCombined: "Sign in to Kanvas",
						subtitle:
							"Pick up where your team left off and keep the work moving.",
						subtitleCombined:
							"Pick up where your team left off and keep the work moving.",
					},
				},
				signUp: {
					start: {
						title: "Build your Kanvas workspace",
						subtitle:
							"Create your account and bring projects, tasks, and teammates into focus.",
					},
				},
			}}
		>
			<html lang="en" suppressHydrationWarning>
				<head>
					<Script id="kanvas-theme-init" strategy="beforeInteractive">
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
