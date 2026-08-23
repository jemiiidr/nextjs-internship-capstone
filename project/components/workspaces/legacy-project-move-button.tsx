"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { moveLegacyProjectToActiveWorkspaceAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";

export function LegacyProjectMoveButton({ projectId }: { projectId: string }) {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [isPending, startTransition] = useTransition();

	const moveProject = () => {
		startTransition(async () => {
			const result = await moveLegacyProjectToActiveWorkspaceAction(projectId);
			setMessage(result.message);
			if (result.success) router.refresh();
		});
	};

	return (
		<div className="flex shrink-0 flex-col items-end gap-1">
			<Button
				type="button"
				size="sm"
				variant="secondary"
				disabled={isPending}
				onClick={moveProject}
			>
				{isPending ? (
					<Loader2 size={14} className="animate-spin" />
				) : (
					<ArrowRight size={14} />
				)}
				Move here
			</Button>
			{message && !isPending ? (
				<span className="max-w-48 text-right text-[10px] text-paynes_gray-500">
					{message}
				</span>
			) : null}
		</div>
	);
}
