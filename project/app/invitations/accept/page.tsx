import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { ClerkAuth } from "@/components/auth/clerk-auth";

export const metadata: Metadata = { title: "Join workspace" };

export default function AcceptInvitationPage() {
	return (
		<AuthShell
			eyebrow="You’re invited"
			title="Join your team on Kanvas"
			description="Complete your account details to accept the invitation and start collaborating."
		>
			<ClerkAuth mode="invitation" />
		</AuthShell>
	);
}
