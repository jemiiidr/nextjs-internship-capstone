"use client";

import { useOrganizationList } from "@clerk/nextjs";
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
			variant="ghost"
			size="sm"
			className="h-auto px-0 py-1 text-blue_munsell-600 hover:translate-y-0 hover:bg-transparent hover:text-blue_munsell-700 dark:text-blue_munsell-300"
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
			{isPending ? "Switching…" : "Open workspace"}
		</Button>
	);
}
