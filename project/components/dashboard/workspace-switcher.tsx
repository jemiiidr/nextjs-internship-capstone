"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({
	activeWorkspaceId,
}: {
	activeWorkspaceId: string | null;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const { isLoaded, setActive, userMemberships } = useOrganizationList({
		userMemberships: { infinite: true, pageSize: 20 },
	});
	const memberships = userMemberships.data ?? [];
	const active = memberships.find(
		(membership) => membership.organization.id === activeWorkspaceId,
	);

	const selectWorkspace = (organizationId: string) => {
		if (!setActive || organizationId === activeWorkspaceId) {
			setOpen(false);
			return;
		}
		startTransition(async () => {
			await setActive({ organization: organizationId });
			setOpen(false);
			router.push("/dashboard");
			router.refresh();
		});
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className="flex w-full items-center gap-3 rounded-xl border border-french_gray-300 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-blue_munsell-200 dark:border-paynes_gray-800 dark:bg-outer_space-400"
				aria-expanded={open}
			>
				{active?.organization.imageUrl ? (
					<span className="relative size-8 overflow-hidden rounded-lg">
						<Image
							src={active.organization.imageUrl}
							alt=""
							fill
							sizes="32px"
							className="object-cover"
						/>
					</span>
				) : (
					<span className="grid size-8 place-items-center rounded-lg bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
						<Building2 size={16} />
					</span>
				)}
				<span className="min-w-0 flex-1">
					<span className="block truncate text-[11px] font-medium uppercase tracking-wide text-paynes_gray-400">
						Workspace
					</span>
					<span className="block truncate text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
						{!isLoaded
							? "Loading…"
							: (active?.organization.name ?? "Choose workspace")}
					</span>
				</span>
				<ChevronsUpDown size={15} className="text-paynes_gray-400" />
			</button>

			{open ? (
				<div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-2xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-800 dark:bg-outer_space-400">
					<div className="max-h-64 overflow-y-auto scrollbar-thin">
						{memberships.map((membership) => (
							<button
								key={membership.id}
								type="button"
								disabled={isPending}
								onClick={() => selectWorkspace(membership.organization.id)}
								className={cn(
									"flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-platinum-100 dark:hover:bg-outer_space-300",
									membership.organization.id === activeWorkspaceId &&
										"bg-blue_munsell-50 text-blue_munsell-700 dark:bg-blue_munsell-900/30 dark:text-blue_munsell-200",
								)}
							>
								<span className="min-w-0 flex-1 truncate font-medium">
									{membership.organization.name}
								</span>
								{membership.organization.id === activeWorkspaceId ? (
									<Check size={14} />
								) : null}
							</button>
						))}
						{userMemberships.hasNextPage ? (
							<button
								type="button"
								onClick={() => userMemberships.fetchNext()}
								className="w-full rounded-xl px-2.5 py-2 text-left text-xs text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300"
							>
								Load more workspaces
							</button>
						) : null}
					</div>
					<div className="mt-1 border-t border-french_gray-200 pt-1 dark:border-paynes_gray-800">
						<Link
							href="/workspaces"
							onClick={() => setOpen(false)}
							className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-paynes_gray-600 hover:bg-platinum-100 dark:text-french_gray-300 dark:hover:bg-outer_space-300"
						>
							<Building2 size={15} /> Manage workspaces
						</Link>
						<Link
							href="/workspaces/new"
							onClick={() => setOpen(false)}
							className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium text-blue_munsell-600 hover:bg-blue_munsell-50 dark:text-blue_munsell-300 dark:hover:bg-blue_munsell-900/30"
						>
							<Plus size={15} /> New workspace
						</Link>
					</div>
				</div>
			) : null}
		</div>
	);
}
