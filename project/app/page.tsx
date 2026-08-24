import { ArrowRight, BarChart3, Building2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { LandingExperience } from "@/components/landing/landing-experience";
import { FloatingOrb, Parallax, Reveal } from "@/components/landing/landing-motion";
import { Button } from "@/components/ui/button";

const taskFlowBars = [
	{ id: "day-01", height: 35 },
	{ id: "day-02", height: 52 },
	{ id: "day-03", height: 42 },
	{ id: "day-04", height: 68 },
	{ id: "day-05", height: 58 },
	{ id: "day-06", height: 76 },
	{ id: "day-07", height: 64 },
	{ id: "day-08", height: 88 },
	{ id: "day-09", height: 72 },
	{ id: "day-10", height: 93 },
] as const;

const analyticsFeatures = [
	"Live task and project metrics",
	"Workspace-scoped reporting",
	"Clear, decision-ready visualizations",
] as const;

const analyticsStats = [
	{
		label: "Completion",
		value: "78%",
		tone: "bg-[#f1efff] text-[#6558df] dark:bg-blue_munsell-900/55 dark:text-blue_munsell-300",
	},
	{
		label: "In progress",
		value: "24",
		tone: "bg-[#fff7e8] text-[#b88329] dark:bg-[#342d21] dark:text-[#edc87d]",
	},
	{
		label: "Overdue",
		value: "4",
		tone: "bg-[#fff0f2] text-[#c75d6c] dark:bg-[#3a242c] dark:text-[#f09aa6]",
	},
] as const;

export default function HomePage() {
	return (
		<LandingExperience>
			<div className="min-h-screen bg-background">
				<Header />

				<main>
					<Hero />

					<Features />

					<section
						id="analytics"
						className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
					>
						<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
							<Reveal>
								<p className="text-sm font-semibold text-[#479977]">
									Know what is moving
								</p>

								<h2 className="mt-2 text-3xl font-bold tracking-tight text-outer_space-900 sm:text-4xl dark:text-platinum-50">
									See the shape of work as it changes.
								</h2>

								<p className="mt-4 max-w-xl leading-7 text-paynes_gray-500">
									Kanvas turns activity into a clear view of progress, overdue work,
									status distribution, and team flow—without another reporting tool.
								</p>

								<div className="mt-6 space-y-3 text-sm text-paynes_gray-600 dark:text-french_gray-300">
									{analyticsFeatures.map((item) => (
										<p key={item} className="flex items-center gap-2">
											<CheckCircle2 size={16} className="text-[#76caa5]" />
											{item}
										</p>
									))}
								</div>
							</Reveal>

							<Parallax
								distance={28}
								className="flowora-panel rounded-3xl border border-french_gray-300 bg-white p-6 dark:border-paynes_gray-800 dark:bg-outer_space-500"
							>
								<div className="grid grid-cols-3 gap-3">
									{analyticsStats.map((stat) => (
										<div
											key={stat.label}
											className={`rounded-2xl p-4 ${stat.tone}`}
										>
											<p className="text-2xl font-bold">{stat.value}</p>

											<p className="mt-1 text-xs">{stat.label}</p>
										</div>
									))}
								</div>

								<div className="mt-5 rounded-2xl bg-platinum-100 p-5 dark:bg-outer_space-400">
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold">Task flow</p>

										<BarChart3 size={17} className="text-blue_munsell-500" />
									</div>

									<div className="mt-5 flex h-28 items-end gap-2">
										{taskFlowBars.map((bar) => (
											<span
												key={bar.id}
												className="flex-1 rounded-t-md bg-linear-to-t from-blue_munsell-400 to-[#72bada]"
												style={{
													height: `${bar.height}%`,
												}}
											/>
										))}
									</div>
								</div>
							</Parallax>
						</div>
					</section>

					<section
						id="workspaces"
						className="bg-white px-4 py-24 sm:px-6 lg:px-8 dark:bg-outer_space-800"
					>
						<Reveal className="mx-auto max-w-7xl rounded-4xl bg-linear-to-r from-blue_munsell-500 via-[#b26fce] to-[#f29586] p-px shadow-[0_24px_80px_rgba(116,103,240,.14)]">
							<div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-white px-7 py-12 text-center dark:bg-outer_space-500 sm:px-12">
								<FloatingOrb className="-right-20 -top-32 size-92 border-blue_munsell-400/15" />
								<span className="relative mx-auto grid size-12 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/60 dark:text-blue_munsell-300">
									<Building2 size={21} />
								</span>

								<h2 className="mt-5 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
									A separate Kanvas for every team.
								</h2>

								<p className="relative mx-auto mt-3 max-w-2xl text-paynes_gray-500 dark:text-french_gray-400">
									Move between teams without mixing projects, members, or permissions.
									Each workspace stays focused, secure, and ready for its own way of working.
								</p>

								<Link href="/sign-up" className="mt-7 inline-block">
									<Button>
										Open a blank Kanvas
										<ArrowRight size={16} />
									</Button>
								</Link>
							</div>
						</Reveal>
					</section>
				</main>

				<Footer />
			</div>
		</LandingExperience>
	);
}
