import { ArrowRight, CalendarDays, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import {
	FloatingOrb,
	HeroScene,
	Parallax,
	Reveal,
} from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";

const previewColumns = [
	{
		name: "To Do",
		tone: "bg-violet-50 dark:bg-[#252343]",
		dot: "bg-[#9187f5]",
		cards: ["Customer research", "Write launch copy"],
	},
	{
		name: "In Progress",
		tone: "bg-amber-50 dark:bg-[#342d21]",
		dot: "bg-[#e9be65]",
		cards: ["Build onboarding", "API integration"],
	},
	{
		name: "In Review",
		tone: "bg-sky-50 dark:bg-[#1d303b]",
		dot: "bg-[#72bada]",
		cards: ["Pricing page"],
	},
	{
		name: "Done",
		tone: "bg-emerald-50 dark:bg-[#20352f]",
		dot: "bg-[#76caa5]",
		cards: ["Project brief"],
	},
];

export function Hero() {
	return (
		<HeroScene className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#f8f5ff_0%,#edf7ff_38%,#fff5f9_70%,#effcf8_100%)] px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 dark:bg-[linear-gradient(135deg,#171426_0%,#121d29_40%,#21151e_72%,#12231f_100%)]">
			<div
				className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[70%] bg-[radial-gradient(ellipse_at_top,rgba(145,135,245,.34),transparent_55%),radial-gradient(ellipse_at_78%_24%,rgba(114,186,218,.28),transparent_42%),radial-gradient(ellipse_at_20%_58%,rgba(233,137,184,.2),transparent_38%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(116,103,240,.28),transparent_55%),radial-gradient(ellipse_at_78%_24%,rgba(31,142,178,.2),transparent_42%),radial-gradient(ellipse_at_20%_58%,rgba(191,82,136,.14),transparent_38%)]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-x-0 top-[30%] z-0 mx-auto h-72 max-w-5xl rounded-[100%] border border-white/50 bg-white/15 blur-2xl dark:border-white/5 dark:bg-white/[.025]"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--border)_38%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_38%,transparent)_1px,transparent_1px)] bg-size-[64px_64px] opacity-55 mask-[radial-gradient(ellipse_at_top,black,transparent_78%)]"
				aria-hidden="true"
			/>
			<FloatingOrb className="-left-32 top-32 size-88 bg-linear-to-br from-[#9187f5]/16 to-[#72bada]/8 shadow-[inset_0_0_70px_rgba(145,135,245,.12)]" />
			<FloatingOrb
				className="-right-20 top-12 size-56 bg-linear-to-br from-[#e989b8]/14 to-[#e9be65]/8 shadow-[inset_0_0_60px_rgba(233,137,184,.12)]"
				delay={-5}
			/>
			<div className="relative z-10 mx-auto max-w-7xl text-center">
				<Reveal>
					<span className="inline-flex items-center rounded-full border border-blue_munsell-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-blue_munsell-700 shadow-sm dark:border-blue_munsell-800 dark:bg-outer_space-500 dark:text-blue_munsell-200">
						Kanban structure. Canvas freedom.
					</span>
				</Reveal>
				<Reveal delay={0.1}>
					<h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold tracking-[-0.04em] text-outer_space-900 sm:text-6xl lg:text-7xl dark:text-platinum-50">
						Turn every plan into a{" "}
						<span className="bg-linear-to-r from-blue_munsell-500 via-[#b26fce] to-[#72bada] bg-clip-text text-transparent">
							living Kanvas.
						</span>
					</h1>
				</Reveal>
				<Reveal delay={0.18}>
					<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-paynes_gray-500 dark:text-french_gray-400">
						Kanvas combines the clarity of kanban with the flexibility of a
						shared canvas—so teams can shape ideas, track work, and ship
						together.
					</p>
				</Reveal>
				<Reveal
					delay={0.24}
					className="mt-8 flex flex-wrap justify-center gap-3"
				>
					<Link href="/sign-up">
						<Button className="h-11 px-6">
							Create your Kanvas <ArrowRight size={16} />
						</Button>
					</Link>
					<Link href="/sign-in">
						<Button variant="secondary" className="h-11 px-6">
							View your workspace
						</Button>
					</Link>
				</Reveal>
			</div>

			<Parallax
				distance={34}
				className="relative z-10 mx-auto mt-14 max-w-6xl rounded-4xl border border-white/80 bg-white/80 p-3 shadow-[0_30px_80px_rgba(31,38,64,.12)] backdrop-blur dark:border-paynes_gray-800 dark:bg-outer_space-500/80 dark:shadow-[0_30px_90px_rgba(0,0,0,.28)]"
			>
				<div className="absolute -right-3 top-20 hidden rounded-full border border-french_gray-200 bg-white/90 px-3 py-2 text-xs font-semibold text-[#479977] shadow-lg sm:block dark:border-paynes_gray-700 dark:bg-outer_space-400">
					+12% momentum
				</div>
				<div className="flex items-center justify-between border-b border-french_gray-200 px-4 py-3 dark:border-paynes_gray-800">
					<div>
						<p className="text-xs font-semibold text-blue_munsell-600">
							Product Team
						</p>
						<p className="text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
							Launch canvas
						</p>
					</div>
					<div className="flex -space-x-2">
						<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#9187f5] text-[10px] font-semibold text-white dark:border-outer_space-500">
							GL
						</span>
						<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#e989b8] text-[10px] font-semibold text-white dark:border-outer_space-500">
							AM
						</span>
						<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#72bada] text-[10px] font-semibold text-white dark:border-outer_space-500">
							JR
						</span>
					</div>
				</div>
				<div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
					{previewColumns.map((column) => (
						<div key={column.name} className={`rounded-2xl p-3 ${column.tone}`}>
							<div className="flex items-center justify-between text-xs font-semibold text-outer_space-500 dark:text-platinum-200">
								<span className="flex items-center gap-2">
									<span className={`size-2 rounded-full ${column.dot}`} />
									{column.name}
								</span>
								<span>{column.cards.length}</span>
							</div>
							<div className="mt-3 space-y-2">
								{column.cards.map((card, cardIndex) => (
									<div
										key={card}
										className="rounded-xl border border-white bg-white p-3 text-left shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-500"
									>
										<p className="text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
											{card}
										</p>
										<div className="mt-3 flex items-center justify-between text-[10px] text-paynes_gray-400">
											<span className="flex items-center gap-1">
												<CalendarDays size={11} /> May {18 + cardIndex}
											</span>
											<span className="flex items-center gap-1">
												<MessageSquare size={11} /> {cardIndex + 1}
											</span>
										</div>
									</div>
								))}
							</div>
							<p className="mt-3 flex items-center gap-1 text-xs text-paynes_gray-500 dark:text-french_gray-400">
								<Plus size={12} /> Add task
							</p>
						</div>
					))}
				</div>
			</Parallax>
		</HeroScene>
	);
}
