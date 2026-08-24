"use client";

import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { ArrowRight, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KanvasLogo } from "@/components/kanvas-logo";
import { SpectrumAura } from "@/components/landing/landing-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
	const { isLoaded, isSignedIn } = useAuth();
	const { signOut } = useClerk();
	const { user } = useUser();
	const [accountOpen, setAccountOpen] = useState(false);
	const accountRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!accountOpen) return;
		const close = (event: PointerEvent) => { if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false); };
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [accountOpen]);

	return (
		<header className="sticky top-0 z-40 border-b border-french_gray-300/70 bg-white/85 backdrop-blur-xl dark:border-paynes_gray-800 dark:bg-outer_space-800/85">
			<SpectrumAura />
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<KanvasLogo />
				<nav className="hidden items-center gap-7 text-sm font-medium text-paynes_gray-500 md:flex">
					<Link
						href="#features"
						className="transition hover:text-blue_munsell-600"
					>
						Features
					</Link>
					<Link
						href="#analytics"
						className="transition hover:text-blue_munsell-600"
					>
						Analytics
					</Link>
					<Link
						href="#workspaces"
						className="transition hover:text-blue_munsell-600"
					>
						Workspaces
					</Link>
				</nav>
				<div className="flex items-center gap-2">
					<ThemeToggle compact />
					{isLoaded && !isSignedIn ? (
						<>
							<Link href="/sign-in">
								<Button variant="ghost" size="sm">
									Log in
								</Button>
							</Link>
							<Link href="/sign-up">
								<Button size="sm">
									Get started <ArrowRight size={14} />
								</Button>
							</Link>
						</>
					) : null}
					{isLoaded && isSignedIn ? (
						<>
							<Link href="/dashboard">
								<Button size="sm">
									Open Kanvas <ArrowRight size={14} />
								</Button>
							</Link>
							<div ref={accountRef} className="relative">
								<button
									type="button"
									aria-label="Open account menu"
									onClick={() => setAccountOpen((value) => !value)}
								>
									<Avatar
										name={user?.fullName ?? "User"}
										src={user?.imageUrl}
										className="size-8"
									/>
								</button>
								{accountOpen ? (
									<div className="absolute right-0 top-[calc(100%+8px)] w-48 animate-in fade-in slide-in-from-top-1 rounded-2xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-800 dark:bg-outer_space-400">
										<Link
											href="/settings"
											onClick={() => setAccountOpen(false)}
											className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-platinum-100 dark:hover:bg-outer_space-300"
										>
											<Settings size={15} /> Settings
										</Link>
										<button
											type="button"
											onClick={() => void signOut({ redirectUrl: "/sign-in" })}
											className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"
										>
											<LogOut size={15} /> Sign out
										</button>
									</div>
								) : null}
							</div>
						</>
					) : null}
				</div>
			</div>
		</header>
	);
}
