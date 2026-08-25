"use client";

import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { KanvasLogo } from "@/components/kanvas-logo";

function AuthBrandNavigation() {
	return (
		<nav
			aria-label="Authentication navigation"
			className="flex flex-col items-start gap-4"
		>
			<Link
				href="/"
				aria-label="Back to Kanvas home"
				title="Back to Kanvas home"
				className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-paynes_gray-500 transition hover:bg-white/70 hover:text-blue_munsell-600 dark:text-french_gray-400 dark:hover:bg-outer_space-500/70 dark:hover:text-blue_munsell-300"
			>
				<ArrowLeft size={15} />
				Back to home
			</Link>
			<KanvasLogo />
		</nav>
	);
}

export function AuthShell({
	children,
	eyebrow,
	title,
	description,
	showIntro = true,
}: {
	children: ReactNode;
	eyebrow: string;
	title: string;
	description: string;
	showIntro?: boolean;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<main className="flowora-auth-background relative min-h-screen overflow-hidden">
			{[
				"left-[7%] top-[12%] size-36 bg-linear-to-br from-blue_munsell-400/40 to-sky-400/25",
				"right-[6%] top-[17%] size-24 bg-linear-to-br from-[#f29586]/35 to-[#e989b8]/25",
				"bottom-[8%] left-[43%] size-28 bg-linear-to-br from-[#76caa5]/30 to-[#e9be65]/25",
			].map((className, index) => (
				<motion.div
					key={className}
					aria-hidden="true"
					className={`pointer-events-none absolute rounded-full opacity-50 ${className}`}
					animate={
						reduceMotion ? undefined : { y: [0, -18, 0], rotate: [0, 8, 0] }
					}
					transition={{
						duration: 9,
						delay: index * -3,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			))}

			<div className="relative z-10 mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
				<section className="relative hidden flex-col justify-between overflow-hidden border-r border-white/20 p-10 lg:flex xl:p-14 dark:border-white/5">
					<AuthBrandNavigation />
					<div className="max-w-xl py-16">
						<p className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue_munsell-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-blue_munsell-700 shadow-sm backdrop-blur dark:border-blue_munsell-800 dark:bg-outer_space-500/70 dark:text-blue_munsell-200">
							<Sparkles size={14} /> Plan brightly. Ship together.
						</p>
						<h1 className="text-5xl font-bold leading-[1.08] tracking-tight text-outer_space-900 dark:text-platinum-50 xl:text-6xl">
							Make teamwork feel
							<span className="block bg-linear-to-r from-blue_munsell-500 via-[#e989b8] to-[#f29586] bg-clip-text text-transparent">
								wonderfully clear.
							</span>
						</h1>
						<p className="mt-6 max-w-lg text-lg leading-8 text-paynes_gray-500 dark:text-french_gray-400">
							Projects, priorities, and people stay aligned in one colorful
							workspace.
						</p>
						<div className="mt-8 grid gap-3 text-sm text-paynes_gray-600 dark:text-french_gray-300 sm:grid-cols-2">
							<span className="flex items-center gap-2">
								<CheckCircle2 size={16} className="text-[#76caa5]" /> Focused
								Kanban boards
							</span>
							<span className="flex items-center gap-2">
								<CheckCircle2 size={16} className="text-[#76caa5]" /> Shared
								team visibility
							</span>
						</div>
					</div>
					<p className="text-xs text-paynes_gray-400">
						Kanvas · Make work visible
					</p>
				</section>

				<section className="flex min-h-screen flex-col px-4 py-5 sm:px-8 lg:px-12 xl:px-20">
					<div className="lg:hidden">
						<AuthBrandNavigation />
					</div>

					<div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
						{showIntro ? (
							<div className="mb-6">
								<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
									{eyebrow}
								</p>
								<h2 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
									{title}
								</h2>
								<p className="mt-2 leading-6 text-paynes_gray-500 dark:text-french_gray-400">
									{description}
								</p>
							</div>
						) : null}
						{children}
					</div>
				</section>
			</div>
		</main>
	);
}
