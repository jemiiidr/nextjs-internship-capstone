import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ClerkAuth } from "@/components/auth/clerk-auth";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
	return (
		<AuthShell
			eyebrow="Start creating"
			title="Build your Flowora workspace"
			description="Create your account and bring projects, tasks, and teammates into focus."
		>
			<ClerkAuth mode="sign-up" />
		</AuthShell>
	);
}
