"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme } from "@/components/theme-provider";

export function ClerkAuth({
	mode,
}: {
	mode: "sign-in" | "sign-up" | "invitation";
}) {
	const { theme, accentColor } = useTheme();
	const appearance = {
		variables: {
			colorPrimary: accentColor,
			colorBackground: theme === "dark" ? "#151517" : "#ffffff",
			colorInputBackground: theme === "dark" ? "#202023" : "#ffffff",
			colorInputText: theme === "dark" ? "#f3f4f8" : "#172033",
			colorText: theme === "dark" ? "#f3f4f8" : "#172033",
			colorTextSecondary: theme === "dark" ? "#aeb5c4" : "#667085",
			colorNeutral: theme === "dark" ? "#f3f4f8" : "#172033",
			borderRadius: "0.875rem",
		},
		elements: {
			rootBox: "w-full",
			cardBox: "w-full shadow-none",
			card: "w-full border border-french_gray-300 shadow-2xl shadow-outer_space-900/10 dark:border-paynes_gray-700 dark:shadow-black/25",
			footer: "bg-transparent",
			footerActionLink: "text-blue_munsell-600 dark:text-blue_munsell-300",
			formButtonPrimary:
				"bg-blue_munsell-500 hover:bg-blue_munsell-600 shadow-sm shadow-blue_munsell-500/20",
			formFieldInput:
				"border-french_gray-300 dark:border-paynes_gray-700 dark:bg-outer_space-500",
			socialButtonsBlockButton:
				"border-french_gray-300 dark:border-paynes_gray-700 dark:bg-outer_space-500 dark:text-platinum-50",
			dividerLine: "bg-french_gray-300 dark:bg-paynes_gray-700",
			dividerText: "text-paynes_gray-500 dark:text-french_gray-400",
		},
	};

	if (mode === "sign-in") {
		return (
			<SignIn
				routing="path"
				path="/sign-in"
				signUpUrl="/sign-up"
				fallbackRedirectUrl="/workspaces"
				appearance={appearance}
			/>
		);
	}

	if (mode === "invitation")
		return (
			<SignUp
				routing="hash"
				signInUrl="/sign-in"
				forceRedirectUrl="/team"
				appearance={appearance}
			/>
		);

	return (
		<SignUp
			routing="path"
			path="/sign-up"
			signInUrl="/sign-in"
			fallbackRedirectUrl="/workspaces"
			appearance={appearance}
		/>
	);
}
