import {
	BarChart3,
	CalendarDays,
	LayoutDashboard,
	ShieldCheck,
	Users,
	Workflow,
} from "lucide-react";
import { FeatureMotion, Reveal } from "@/components/landing/landing-motion";

const features = [
	{
		icon: LayoutDashboard,
		title: "Your work, on one canvas",
		copy: "Move ideas through clear stages on a fast, flexible kanban canvas.",
		tone: "bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/55 dark:text-blue_munsell-300",
		accent: "from-[#9187f5] to-[#e989b8]",
		layout: "md:col-span-2 lg:col-span-2",
		visual: "board",
	},
	{
		icon: Users,
		title: "One home for every team",
		copy: "Keep roles, people, and projects isolated in focused workspaces.",
		tone: "bg-pink-50 text-[#c76193] dark:bg-[#3a2334] dark:text-[#f0a8cb]",
		accent: "from-[#e989b8] to-[#f29586]",
		layout: "",
		visual: "people",
	},
	{
		icon: BarChart3,
		title: "Signals, not noise",
		copy: "See progress, overdue work, and flow at a glance.",
		tone: "bg-emerald-50 text-[#479977] dark:bg-[#20352f] dark:text-[#8ed9b9]",
		accent: "from-[#76caa5] to-[#72bada]",
		layout: "",
		visual: "chart",
	},
	{
		icon: CalendarDays,
		title: "Deadlines in context",
		copy: "See what is due and jump directly into the work that needs attention.",
		tone: "bg-amber-50 text-[#a87525] dark:bg-[#342d21] dark:text-[#edc87d]",
		accent: "from-[#e9be65] to-[#f5ad78]",
		layout: "lg:col-span-2",
		visual: "calendar",
	},
	{
		icon: ShieldCheck,
		title: "Access with guardrails",
		copy: "Server-enforced workspace roles keep every action scoped to the right team.",
		tone: "bg-sky-50 text-[#4d8fac] dark:bg-[#1d303b] dark:text-[#8dcae4]",
		accent: "from-[#72bada] to-[#9187f5]",
		layout: "",
		visual: "shield",
	},
	{
		icon: Workflow,
		title: "Collaboration with focus",
		copy: "Assign, discuss, and follow important changes without status-meeting overload.",
		tone: "bg-orange-50 text-[#b96759] dark:bg-[#382724] dark:text-[#f3aa9e]",
		accent: "from-[#f29586] to-[#e9be65]",
		layout: "md:col-span-2 lg:col-span-3",
		visual: "flow",
	},
] as const;

function FeatureVisual({
	type,
}: {
	type: (typeof features)[number]["visual"];
}) {
	if (type === "chart")
		return (
			<div className="mt-8 flex h-16 items-end gap-1.5" aria-hidden="true">
				{[35, 68, 48, 82, 62, 94].map((height) => (
					<span
						key={height}
						className="flex-1 rounded-t bg-current opacity-20"
						style={{ height: `${height}%` }}
					/>
				))}
			</div>
		);
	if (type === "people")
		return (
			<div className="mt-9 flex -space-x-3" aria-hidden="true">
				{["#9187f5", "#e989b8", "#72bada", "#76caa5"].map((color, index) => (
					<span
						key={color}
						className="grid size-11 place-items-center rounded-full border-4 border-card text-[10px] font-bold text-white"
						style={{
							background: color,
							transform: `translateY(${index % 2 ? 5 : 0}px)`,
						}}
					>
						{String.fromCharCode(65 + index)}
					</span>
				))}
			</div>
		);
	return (
		<div className="mt-8 grid grid-cols-3 gap-2" aria-hidden="true">
			{[0, 1, 2].map((item) => (
				<span key={item} className="h-2 rounded-full bg-current opacity-15" />
			))}
			<span className="col-span-2 h-2 rounded-full bg-current opacity-25" />
			<span className="h-2 rounded-full bg-current opacity-10" />
		</div>
	);
}

export function Features() {
	return (
		<section
			id="features"
			className="bg-white px-4 py-24 sm:px-6 lg:px-8 dark:bg-outer_space-800"
		>
			<div className="mx-auto max-w-7xl">
				<Reveal className="max-w-2xl">
					<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						Built for visual momentum
					</p>
					<h2 className="mt-2 text-3xl font-bold tracking-tight text-outer_space-900 sm:text-4xl dark:text-platinum-50">
						Structure when you need it. Space when you don’t.
					</h2>
					<p className="mt-4 text-paynes_gray-500 dark:text-french_gray-400">
						Kanvas keeps projects, people, deadlines, and decisions visible
						without turning your workspace into noise.
					</p>
				</Reveal>
				<div className="mt-12 grid auto-rows-[minmax(15rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => (
						<FeatureMotion
							key={feature.title}
							delay={index * 0.065}
							className={`group relative overflow-hidden rounded-[1.75rem] border border-french_gray-300 bg-platinum-50 p-6 dark:border-paynes_gray-800 dark:bg-outer_space-500 ${feature.layout}`}
						>
							<div
								className={`absolute inset-x-8 top-0 h-px bg-linear-to-r ${feature.accent}`}
							/>
							<span
								className={`grid size-11 place-items-center rounded-2xl ${feature.tone}`}
							>
								<feature.icon size={19} />
							</span>
							<h3 className="mt-5 text-lg font-semibold text-outer_space-900 dark:text-platinum-50">
								{feature.title}
							</h3>
							<p className="mt-2 max-w-lg text-sm leading-6 text-paynes_gray-500 dark:text-french_gray-400">
								{feature.copy}
							</p>
							<FeatureVisual type={feature.visual} />
						</FeatureMotion>
					))}
				</div>
			</div>
		</section>
	);
}
