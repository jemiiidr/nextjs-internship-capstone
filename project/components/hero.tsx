import { ArrowRight, CheckCircle2, GripVertical, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
	return (
		<section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(25,133,161,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(49,183,214,0.12),transparent_32%)]" />
			<div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
				<div>
					<span className="inline-flex rounded-full border border-blue_munsell-200 bg-blue_munsell-50 px-3 py-1 text-sm font-medium text-blue_munsell-700 dark:border-blue_munsell-800 dark:bg-blue_munsell-900/50 dark:text-blue_munsell-200">
						Plan clearly. Ship confidently.
					</span>
					<h1 className="mt-6 max-w-3xl text-balance text-5xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50 sm:text-6xl">
						Keep projects moving without losing the details.
					</h1>
					<p className="mt-6 max-w-2xl text-lg leading-8 text-paynes_gray-500 dark:text-french_gray-400">
						Create boards, assign work, discuss tasks, and track progress in one
						secure workspace. ProjectFlow is built for teams that want clarity
						instead of status-meeting overload.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<Link href="/sign-up">
							<Button className="h-12 px-6 text-base">
								Create your workspace <ArrowRight size={18} />
							</Button>
						</Link>
						<Link href="/sign-in">
							<Button variant="secondary" className="h-12 px-6 text-base">
								Open an existing account
							</Button>
						</Link>
					</div>
					<div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						<span className="flex items-center gap-2">
							<CheckCircle2 size={16} className="text-blue_munsell-500" />{" "}
							Role-based access
						</span>
						<span className="flex items-center gap-2">
							<CheckCircle2 size={16} className="text-blue_munsell-500" />{" "}
							Optimistic updates
						</span>
						<span className="flex items-center gap-2">
							<CheckCircle2 size={16} className="text-blue_munsell-500" />{" "}
							Keyboard friendly
						</span>
					</div>
				</div>
				<div className="rounded-3xl border border-french_gray-300 bg-white/90 p-4 shadow-2xl dark:border-paynes_gray-400 dark:bg-outer_space-500/90">
					<div className="mb-4 flex items-center justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-wider text-blue_munsell-500">
								Product launch
							</p>
							<p className="font-semibold text-outer_space-500 dark:text-platinum-500">
								Sprint board
							</p>
						</div>
						<div className="flex -space-x-2">
							<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-blue_munsell-500 text-xs text-white dark:border-outer_space-500">
								AL
							</span>
							<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-outer_space-400 text-xs text-white dark:border-outer_space-500">
								JM
							</span>
							<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-paynes_gray-400 text-xs text-white dark:border-outer_space-500">
								KT
							</span>
						</div>
					</div>
					<div className="grid gap-3 sm:grid-cols-3">
						{[
							{
								title: "To do",
								items: ["Research customer needs", "Draft launch brief"],
							},
							{
								title: "In progress",
								items: ["Build onboarding flow", "Review analytics events"],
							},
							{ title: "Done", items: ["Create design system"] },
						].map((column) => (
							<div
								key={column.title}
								className="rounded-xl bg-platinum-100 p-3 dark:bg-outer_space-400"
							>
								<div className="mb-3 flex items-center justify-between text-xs font-semibold text-outer_space-500 dark:text-platinum-500">
									<span>{column.title}</span>
									<span>{column.items.length}</span>
								</div>
								<div className="space-y-2">
									{column.items.map((item) => (
										<div
											key={item}
											className="rounded-lg border border-french_gray-300 bg-white p-3 text-xs font-medium text-paynes_gray-600 shadow-sm dark:border-paynes_gray-400 dark:bg-outer_space-300 dark:text-french_gray-300"
										>
											<GripVertical
												size={12}
												className="mb-2 text-french_gray-500"
											/>
											{item}
										</div>
									))}
								</div>
							</div>
						))}
					</div>
					<div className="mt-4 flex items-center justify-between rounded-xl bg-blue_munsell-50 p-3 text-sm text-blue_munsell-700 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-200">
						<span className="flex items-center gap-2">
							<Users size={16} /> 8 teammates collaborating
						</span>
						<span>72% complete</span>
					</div>
				</div>
			</div>
		</section>
	);
}
