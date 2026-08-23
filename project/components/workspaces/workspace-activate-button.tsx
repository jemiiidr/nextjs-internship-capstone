"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function WorkspaceActivateButton({
	workspaceId,
	active,
}: {
	workspaceId: string;
	active: boolean;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const { setActive } = useOrganizationList();
	return (
		<Button
			variant={active ? "secondary" : "default"}
			size="sm"
			disabled={active || isPending || !setActive}
			onClick={(event) => {
				event.stopPropagation();
				if (!setActive) return;
				startTransition(async () => {
					await setActive({ organization: workspaceId });
					router.push("/dashboard");
					router.refresh();
				});
			}}
		>
			{active ? (
				<>
					<Check size={14} /> Active
				</>
			) : (
				<>
					{isPending ? "Switching…" : "Open"} <ArrowRight size={14} />
				</>
			)}
		</Button>
	);
}
