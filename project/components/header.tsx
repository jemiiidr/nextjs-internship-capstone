"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-french_gray-300 bg-white/90 backdrop-blur dark:border-paynes_gray-400 dark:bg-outer_space-900/90">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<Link
					href="/"
					className="flex items-center gap-2 text-xl font-bold text-outer_space-500 dark:text-platinum-500"
				>
					<span className="grid size-9 place-items-center rounded-xl bg-blue_munsell-500 text-white">
						P
					</span>
					ProjectFlow
				</Link>
				<nav className="hidden items-center gap-6 text-sm text-paynes_gray-500 dark:text-french_gray-400 md:flex">
					<Link href="#features" className="hover:text-blue_munsell-500">
						Features
					</Link>
					<Link href="#workflow" className="hover:text-blue_munsell-500">
						Workflow
					</Link>
					<Link href="#security" className="hover:text-blue_munsell-500">
						Security
					</Link>
				</nav>
				<div className="flex items-center gap-2">
					<ThemeToggle />
					<SignedOut>
						<Link href="/sign-in">
							<Button variant="secondary" size="sm">
								Sign in
							</Button>
						</Link>
						<Link href="/sign-up">
							<Button size="sm">Get started</Button>
						</Link>
					</SignedOut>
					<SignedIn>
						<Link href="/dashboard">
							<Button size="sm">
								<LayoutDashboard size={15} /> Dashboard
							</Button>
						</Link>
						<UserButton />
					</SignedIn>
				</div>
			</div>
		</header>
	);
}
