"use client";

import { useClerk } from "@clerk/nextjs";
import { Check, LogOut, Plus, Settings, SwitchCamera } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/types";

export function AccountMenu({
	user,
	collapsed = false,
}: {
	user: UserSummary;
	collapsed?: boolean;
}) {
	const { client, session, setActive, signOut } = useClerk();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [switching, setSwitching] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const closeOnOutsideClick = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) {
				setOpen(false);
				setSwitching(false);
			}
		};
		document.addEventListener("pointerdown", closeOnOutsideClick);
		return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
	}, [open]);

	return (
		<div ref={menuRef} className="relative">
			<button
				type="button"
				onClick={() => setOpen((value) => !value)}
				className={cn(
					"flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-platinum-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-400 dark:hover:bg-outer_space-400",
					collapsed && "lg:justify-center lg:p-1.5",
				)}
				aria-expanded={open}
			>
				<Avatar name={user.name} src={user.avatarUrl} className="size-9" />
				<div className={cn("min-w-0 flex-1", collapsed && "lg:hidden")}>
					<p className="truncate text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
						{user.name}
					</p>
					<p className="truncate text-[11px] text-paynes_gray-500">
						{user.email}
					</p>
				</div>
			</button>
			{open ? (
				<div
					className={cn(
						"absolute bottom-[calc(100%+8px)] left-0 z-70 w-56 animate-in fade-in slide-in-from-bottom-1 rounded-2xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-800 dark:bg-outer_space-400",
						collapsed && "lg:left-full lg:bottom-0 lg:ml-3",
					)}
				>
					<button
						type="button"
						onClick={() => setSwitching((value) => !value)}
						className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-paynes_gray-600 hover:bg-platinum-100 dark:text-french_gray-300 dark:hover:bg-outer_space-300"
					>
						<SwitchCamera size={15} /> Switch account
					</button>
					{switching ? (
						<div className="my-1 space-y-1 border-y border-french_gray-200 py-1 dark:border-paynes_gray-700">
							{client.sessions.map((item) => (
								<button
									type="button"
									key={item.id}
									onClick={() => startTransition(async () => { await setActive({ session: item.id }); setOpen(false); window.location.assign("/dashboard"); })}
									className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-platinum-100 dark:hover:bg-outer_space-300"
								>
									<Avatar name={item.user?.fullName ?? item.publicUserData.identifier} src={item.user?.imageUrl} className="size-7" />
									<span className="min-w-0 flex-1 truncate text-xs font-medium">{item.user?.primaryEmailAddress?.emailAddress ?? item.publicUserData.identifier}</span>
									{item.id === session?.id ? <Check size={14} className="text-blue_munsell-500" /> : null}
								</button>
							))}
							<Link href="/sign-in?add-account=1" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-blue_munsell-600 hover:bg-blue_munsell-50 dark:text-blue_munsell-300 dark:hover:bg-blue_munsell-950/30"><Plus size={14} /> Add another account</Link>
						</div>
					) : null}
					<Link
						href="/settings"
						onClick={() => setOpen(false)}
						className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-paynes_gray-600 hover:bg-platinum-100 dark:text-french_gray-300 dark:hover:bg-outer_space-300"
					>
						<Settings size={15} /> Manage account
					</Link>
					<button
						type="button"
						disabled={isPending}
						onClick={() =>
							startTransition(() => void signOut({ redirectUrl: "/sign-in" }))
						}
						className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950/30"
					>
						<LogOut size={15} /> {isPending ? "Signing out…" : "Sign out"}
					</button>
				</div>
			) : null}
		</div>
	);
}
