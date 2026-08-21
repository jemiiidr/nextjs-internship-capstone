import { ArrowRight, CalendarDays, MessageSquare, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const previewColumns = [
	{
		name: "To Do",
		tone: "bg-violet-50",
		dot: "bg-[#9187f5]",
		cards: ["Customer research", "Write launch copy"],
	},
	{
		name: "In Progress",
		tone: "bg-amber-50",
		dot: "bg-[#e9be65]",
		cards: ["Build onboarding", "API integration"],
	},
	{
		name: "In Review",
		tone: "bg-sky-50",
		dot: "bg-[#72bada]",
		cards: ["Pricing page"],
	},
	{
		name: "Done",
		tone: "bg-emerald-50",
		dot: "bg-[#76caa5]",
		cards: ["Project brief"],
	},
];

export function Hero() {
	return (
		<section className="flowora-soft-gradient overflow-hidden px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
			<div className="mx-auto max-w-7xl text-center">
				<span className="inline-flex items-center rounded-full border border-blue_munsell-200 bg-white/70 px-3 py-1.5 text-xs font-semibold text-blue_munsell-700 shadow-sm dark:bg-outer_space-500">
					Organize work. Keep momentum.
				</span>
				<h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl font-bold tracking-[-0.04em] text-outer_space-900 sm:text-6xl lg:text-7xl dark:text-platinum-50">
					A colorful way to get{" "}
					<span className="bg-gradient-to-r from-[#f29586] via-[#e9be65] to-[#72bada] bg-clip-text text-transparent">
						work done.
					</span>
				</h1>
				<p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-paynes_gray-500 dark:text-french_gray-400">
					Flowora brings boards, tasks, collaborators, calendars, and workspace
					analytics into one focused project management experience.
				</p>
				<div className="mt-8 flex flex-wrap justify-center gap-3">
					<Link href="/sign-up">
						<Button className="h-11 px-6">
							Get started — it’s free <ArrowRight size={16} />
						</Button>
					</Link>
					<Link href="/sign-in">
						<Button variant="secondary" className="h-11 px-6">
							View your workspace
						</Button>
					</Link>
				</div>
			</div>

			<div className="mx-auto mt-14 max-w-6xl rounded-[2rem] border border-white/80 bg-white/80 p-3 shadow-[0_30px_80px_rgba(31,38,64,.12)] backdrop-blur dark:border-paynes_gray-800 dark:bg-outer_space-500/80">
				<div className="flex items-center justify-between border-b border-french_gray-200 px-4 py-3 dark:border-paynes_gray-800">
					<div>
						<p className="text-xs font-semibold text-blue_munsell-600">
							Product Team
						</p>
						<p className="text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
							Website redesign
						</p>
					</div>
					<div className="flex -space-x-2">
						<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#9187f5] text-[10px] font-semibold text-white">
							GL
						</span>
						<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#e989b8] text-[10px] font-semibold text-white">
							AM
						</span>
						<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-[#72bada] text-[10px] font-semibold text-white">
							JR
						</span>
					</div>
				</div>
				<div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
					{previewColumns.map((column) => (
						<div key={column.name} className={`rounded-2xl p-3 ${column.tone}`}>
							<div className="flex items-center justify-between text-xs font-semibold text-outer_space-500">
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
										className="rounded-xl border border-white bg-white p-3 text-left shadow-sm"
									>
										<p className="text-sm font-semibold text-outer_space-900">
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
							<p className="mt-3 flex items-center gap-1 text-xs text-paynes_gray-500">
								<Plus size={12} /> Add task
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
