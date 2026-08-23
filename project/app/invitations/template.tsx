import type { ReactNode } from "react";
import { PageTransition } from "@/components/page-transition";

export default function InvitationTemplate({
	children,
}: {
	children: ReactNode;
}) {
	return <PageTransition className="min-h-screen">{children}</PageTransition>;
}
