import {
	BarChart3,
	CalendarDays,
	LayoutDashboard,
	ShieldCheck,
	Users,
	Workflow,
} from "lucide-react";

const features = [
	{
		icon: LayoutDashboard,
		title: "Kanban boards",
		copy: "Move work through clear stages with a smooth, keyboard-friendly drag-and-drop board.",
		tone: "bg-[#f1efff] text-[#6558df]",
	},
	{
		icon: Users,
		title: "Workspaces",
		copy: "Switch between Clerk Organizations while keeping membership and access isolated per team.",
		tone: "bg-[#fff0f5] text-[#c76193]",
	},
	{
		icon: BarChart3,
		title: "Analytics",
		copy: "Understand task flow, completion, overdue work, and project progress from real workspace data.",
		tone: "bg-[#edf9f3] text-[#479977]",
	},
	{
		icon: CalendarDays,
		title: "Calendar",
		copy: "See due dates in context and jump directly from a deadline to the project that owns it.",
		tone: "bg-[#fff7e8] text-[#b88329]",
	},
	{
		icon: ShieldCheck,
		title: "Role-based access",
		copy: "Admins, members, and optional viewers are authorized from the active Clerk workspace role.",
		tone: "bg-[#eef8fc] text-[#4d8fac]",
	},
	{
		icon: Workflow,
		title: "Focused collaboration",
		copy: "Assign project collaborators, discuss tasks, and keep activity visible without status-meeting overload.",
		tone: "bg-[#fff2ef] text-[#bf6e61]",
	},
];

export function Features() {
	return (
		<section
			id="features"
			className="bg-white px-4 py-24 sm:px-6 lg:px-8 dark:bg-outer_space-800"
		>
			<div className="mx-auto max-w-7xl">
				<div className="max-w-2xl">
					<p className="text-sm font-semibold text-blue_munsell-600">
						Everything your team needs
					</p>
					<h2 className="mt-2 text-3xl font-bold tracking-tight text-outer_space-900 sm:text-4xl dark:text-platinum-50">
						Powerful enough for projects. Calm enough for daily work.
					</h2>
					<p className="mt-4 text-paynes_gray-500">
						Flowora uses color as a signal, not decoration—keeping the interface
						mostly neutral while important states stay easy to scan.
					</p>
				</div>
				<div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature) => (
						<article
							key={feature.title}
							className="rounded-2xl border border-french_gray-300 p-6 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-paynes_gray-800 dark:bg-outer_space-500"
						>
							<span
								className={`grid size-10 place-items-center rounded-xl ${feature.tone}`}
							>
								<feature.icon size={18} />
							</span>
							<h3 className="mt-5 font-semibold text-outer_space-900 dark:text-platinum-50">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm leading-6 text-paynes_gray-500">
								{feature.copy}
							</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}
