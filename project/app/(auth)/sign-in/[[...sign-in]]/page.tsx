import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ClerkAuth } from "@/components/auth/clerk-auth";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
	return (
		<AuthShell
			eyebrow="Welcome back"
			title="Sign in to Kanvas"
			description="Pick up where your team left off and keep the work moving."
			showIntro={false}
		>
			<ClerkAuth mode="sign-in" />
		</AuthShell>
	);
}
