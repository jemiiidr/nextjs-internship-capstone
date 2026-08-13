import {
	BarChart3,
	CalendarDays,
	Kanban,
	MessageSquare,
	ShieldCheck,
	Users,
} from "lucide-react";

const features = [
	{
		id: "boards",
		icon: Kanban,
		title: "Interactive boards",
		description:
			"Move tasks between ordered lists with pointer and keyboard drag-and-drop.",
	},
	{
		id: "collaboration",
		icon: Users,
		title: "Members and roles",
		description:
			"Owners and admins manage access while viewers stay read-only.",
	},
	{
		id: "planning",
		icon: CalendarDays,
		title: "Due-date planning",
		description:
			"See project and task deadlines together in a focused calendar view.",
	},
	{
		id: "discussion",
		icon: MessageSquare,
		title: "Task conversations",
		description:
			"Keep decisions attached to the work with comments and activity history.",
	},
	{
		id: "insights",
		icon: BarChart3,
		title: "Progress insights",
		description:
			"Track open and completed work across every accessible project.",
	},
	{
		id: "security",
		icon: ShieldCheck,
		title: "Protected workspace",
		description:
			"Clerk authentication and server-side permission checks protect every mutation.",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="border-y border-french_gray-300 bg-white px-4 py-20 dark:border-paynes_gray-400 dark:bg-outer_space-500 sm:px-6 lg:px-8"
		>
			<div className="mx-auto max-w-7xl">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold uppercase tracking-wider text-blue_munsell-500">
						Core features
					</p>
					<h2 className="mt-3 text-3xl font-bold text-outer_space-900 dark:text-platinum-50 sm:text-4xl">
						Everything needed to manage a real team project.
					</h2>
					<p className="mt-4 text-paynes_gray-500 dark:text-french_gray-400">
						The app connects UI state, authenticated server actions, and a
						relational database through one consistent data flow.
					</p>
				</div>
				<div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<article
							key={feature.id}
							className="rounded-2xl border border-french_gray-300 bg-background p-6 dark:border-paynes_gray-400"
						>
							<span className="grid size-11 place-items-center rounded-xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
								<feature.icon size={21} />
							</span>
							<h3 className="mt-5 font-semibold text-outer_space-900 dark:text-platinum-50">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm leading-6 text-paynes_gray-500 dark:text-french_gray-400">
								{feature.description}
							</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
