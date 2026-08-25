"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { Building2, Loader2, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";
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
	const { createOrganization, setActive, userMemberships } =
		useOrganizationList({
			userMemberships: { infinite: true, pageSize: 20 },
		});
	const [name, setName] = useState("");
	const [icon, setIcon] = useState<File | null>(null);
	const [iconPreview, setIconPreview] = useState("");
	const [error, setError] = useState("");
	const [isPending, startTransition] = useTransition();

	useEffect(
		() => () => {
			if (iconPreview) URL.revokeObjectURL(iconPreview);
		},
		[iconPreview],
	);

	const chooseIcon = (file: File | undefined) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setError("Choose an image file for the workspace icon.");
			return;
		}
		if (file.size > 10 * 1024 * 1024) {
			setError("The workspace icon must be 10MB or smaller.");
			return;
		}
		if (iconPreview) URL.revokeObjectURL(iconPreview);
		setIcon(file);
		setIconPreview(URL.createObjectURL(file));
		setError("");
	};

	const clearIcon = () => {
		if (iconPreview) URL.revokeObjectURL(iconPreview);
		setIcon(null);
		setIconPreview("");
	};

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
				if (icon) await organization.setLogo({ file: icon });
				await setActive({ organization: organization.id });
				await userMemberships.revalidate?.();
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
			<div className="flex items-center gap-3">
				<span
					className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-blue_munsell-50 bg-cover bg-center text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300"
					style={
						iconPreview ? { backgroundImage: `url(${iconPreview})` } : undefined
					}
				>
					{iconPreview ? null : <Building2 size={21} />}
				</span>
				<div className="min-w-0">
					<div className="flex items-center gap-1">
						<label
							htmlFor="workspace-icon"
							className="flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-french_gray-300 bg-white px-3 text-sm font-medium text-paynes_gray-600 transition hover:border-blue_munsell-300 hover:text-blue_munsell-600 dark:border-paynes_gray-700 dark:bg-outer_space-400 dark:text-french_gray-300"
						>
							<Upload size={14} /> {icon ? "Change icon" : "Add icon"}
						</label>
						<input
							id="workspace-icon"
							type="file"
							accept="image/*"
							className="sr-only"
							disabled={isPending}
							onChange={(event) => chooseIcon(event.target.files?.[0])}
						/>
						{icon ? (
							<Button
								type="button"
								size="icon"
								variant="ghost"
								className="size-9"
								onClick={clearIcon}
								disabled={isPending}
								aria-label="Use default workspace icon"
							>
								<X size={15} />
							</Button>
						) : null}
					</div>
					<p className="mt-1 text-xs text-paynes_gray-500">
						Optional · image up to 10MB
					</p>
				</div>
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
