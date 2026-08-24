"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { cn } from "@/lib/utils";

export function WorkspaceSwitcher({
	activeWorkspaceId,
	collapsed = false,
}: {
	activeWorkspaceId: string | null;
	collapsed?: boolean;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const switcherRef = useRef<HTMLDivElement>(null);
	const { isLoaded, setActive, userMemberships } = useOrganizationList({
		userMemberships: { infinite: true, pageSize: 20 },
	});
	const memberships = userMemberships.data ?? [];
	const active = memberships.find(
		(membership) => membership.organization.id === activeWorkspaceId,
	);
	useEffect(() => {
		if (!open) return;
		const close = (event: PointerEvent) => {
			if (!switcherRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);

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
		<div ref={switcherRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className={cn(
					"flex w-full items-center gap-3 rounded-xl border border-french_gray-300 bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-blue_munsell-200 dark:border-paynes_gray-800 dark:bg-outer_space-400",
					collapsed && "lg:justify-center lg:border-0 lg:bg-transparent lg:p-1 lg:shadow-none dark:lg:bg-transparent",
				)}
				aria-expanded={open}
				aria-label={collapsed ? `Workspace: ${active?.organization.name ?? "Choose workspace"}` : undefined}
				title={collapsed ? active?.organization.name ?? "Choose workspace" : undefined}
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
				<span className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
					<span className="block truncate text-[11px] font-medium uppercase tracking-wide text-paynes_gray-400">
						Workspace
					</span>
					<span className="block truncate text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
						{!isLoaded
							? "Loading…"
							: (active?.organization.name ?? "Choose workspace")}
					</span>
				</span>
				<ChevronsUpDown size={15} className={cn("text-paynes_gray-400 transition-transform duration-200", open && "rotate-180", collapsed && "lg:hidden")} />
			</button>

			{open ? (
				<div className={cn(
					"absolute left-0 right-0 top-[calc(100%+8px)] z-[70] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-2xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-800 dark:bg-outer_space-400",
					collapsed && "lg:left-full lg:right-auto lg:top-0 lg:ml-3 lg:w-64",
				)}>
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
							href="/workspaces?create=1"
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
