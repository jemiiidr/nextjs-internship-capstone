"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { Building2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function CreateWorkspaceForm({
	embedded = false,
}: {
	embedded?: boolean;
}) {
	const router = useRouter();
	const { createOrganization, setActive } = useOrganizationList();
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const workspaceName = name.trim();
		if (workspaceName.length < 2)
			return setError("Workspace name must contain at least 2 characters.");
		if (workspaceName.length > 100)
			return setError("Workspace name must be 100 characters or fewer.");
		if (!createOrganization || !setActive)
			return setError(
				"Workspace services are still loading. Please try again.",
			);

		setError("");
		startTransition(async () => {
			try {
				const organization = await createOrganization({ name: workspaceName });
				await setActive({ organization: organization.id });
				router.push("/dashboard");
				router.refresh();
			} catch (caught) {
				setError(
					caught instanceof Error
						? caught.message
						: "Unable to create the workspace.",
				);
			}
		});
	};

	return (
		<form
			onSubmit={submit}
			className={cn(
				"space-y-5",
				!embedded &&
					"rounded-3xl border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-800 dark:bg-outer_space-500",
			)}
		>
			<div className="grid size-12 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
				<Building2 size={21} />
			</div>
			<div className="space-y-2">
				<Label htmlFor="workspace-name">Workspace name</Label>
				<Input
					id="workspace-name"
					value={name}
					onChange={(event) => setName(event.target.value)}
					placeholder="e.g. Product team"
					autoComplete="organization"
					maxLength={100}
					disabled={isPending}
				/>
				<p className="text-xs text-paynes_gray-500">
					You will become the workspace administrator. Members can be invited
					from the Team page.
				</p>
			</div>
			{error ? (
				<p
					role="alert"
					className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
				>
					{error}
				</p>
			) : null}
			<Button type="submit" disabled={isPending || !name.trim()}>
				{isPending ? (
					<>
						<Loader2 size={16} className="animate-spin" /> Creating workspace…
					</>
				) : (
					"Create workspace"
				)}
			</Button>
		</form>
	);
}
