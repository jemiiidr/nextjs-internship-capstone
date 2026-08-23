"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { FloworaLogo } from "@/components/flowora-logo";
import { SpectrumAura } from "@/components/landing/landing-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Header() {
	return (
		<header className="sticky top-0 z-40 border-b border-french_gray-300/70 bg-white/85 backdrop-blur-xl dark:border-paynes_gray-800 dark:bg-outer_space-800/85">
			<SpectrumAura />
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				<FloworaLogo />
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
					<SignedOut>
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
					</SignedOut>
					<SignedIn>
						<Link href="/dashboard">
							<Button size="sm">
								Open Flowora <ArrowRight size={14} />
							</Button>
						</Link>
						<UserButton />
					</SignedIn>
				</div>
			</div>
		</header>
	);
}
