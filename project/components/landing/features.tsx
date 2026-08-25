import {
	ArrowRight,
	BarChart3,
	CalendarDays,
	Check,
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	MoreHorizontal,
	ShieldCheck,
	UserPlus,
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
		layout: "md:col-span-2 lg:col-span-2",
		visual: "flow",
	},
] as const;

function FeatureVisual({
	type,
}: {
	type: (typeof features)[number]["visual"];
}) {
	if (type === "board")
		return (
			<div className="grid w-full grid-cols-3 gap-2" aria-hidden="true">
				{[
					{ label: "To do", cards: ["Research", "Outline"] },
					{ label: "Doing", cards: ["Prototype", "Review"] },
					{ label: "Done", cards: ["Brief"] },
				].map(({ label, cards }, columnIndex) => (
					<div
						key={label}
						className="rounded-xl border border-french_gray-200 bg-white/75 p-2 dark:border-paynes_gray-700 dark:bg-outer_space-400/70"
					>
						<span className="flex items-center gap-1.5 text-[9px] font-semibold text-paynes_gray-500">
							<i
								className={`size-1.5 rounded-full ${columnIndex === 0 ? "bg-[#9187f5]" : columnIndex === 1 ? "bg-[#e9be65]" : "bg-[#76caa5]"}`}
							/>
							{label}
						</span>
						<div className="mt-2 space-y-1.5">
							{cards.map((card) => (
								<span
									key={card}
									className="block h-5 rounded-md border border-french_gray-200 bg-white shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-500"
								/>
							))}
						</div>
					</div>
				))}
			</div>
		);
	if (type === "chart")
		return (
			<div
				className="w-full rounded-xl border border-french_gray-200 bg-white/70 p-3 dark:border-paynes_gray-700 dark:bg-outer_space-400/70"
				aria-hidden="true"
			>
				<div className="flex items-end justify-between gap-3">
					<div>
						<span className="block text-[9px] font-medium text-paynes_gray-400">
							14-day flow
						</span>
						<strong className="text-xl text-outer_space-900 dark:text-platinum-50">
							32
						</strong>
						<span className="ml-1.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-300">
							+18%
						</span>
					</div>
					<div className="flex gap-3 pb-1 text-[8px] text-paynes_gray-400">
						<span className="flex items-center gap-1">
							<i className="size-1.5 rounded-full bg-blue_munsell-500" />{" "}
							Created
						</span>
						<span className="flex items-center gap-1">
							<i className="size-1.5 rounded-full bg-emerald-400" /> Completed
						</span>
					</div>
				</div>
				<svg
					viewBox="0 0 320 88"
					preserveAspectRatio="none"
					className="mt-2 h-18 w-full overflow-visible"
				>
					<title>Created and completed task trends</title>
					<defs>
						<linearGradient
							id="landing-analytics-fill"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="0"
								stopColor="var(--brand-color)"
								stopOpacity=".2"
							/>
							<stop offset="1" stopColor="var(--brand-color)" stopOpacity="0" />
						</linearGradient>
					</defs>
					{[18, 44, 70].map((y) => (
						<line
							key={y}
							x1="0"
							y1={y}
							x2="320"
							y2={y}
							stroke="currentColor"
							strokeOpacity=".09"
							strokeWidth="1"
						/>
					))}
					<path
						d="M0,68 L53,55 L106,61 L160,38 L213,45 L266,24 L320,30 L320,88 L0,88 Z"
						fill="url(#landing-analytics-fill)"
					/>
					<polyline
						points="0,68 53,55 106,61 160,38 213,45 266,24 320,30"
						fill="none"
						stroke="var(--brand-color)"
						strokeWidth="2"
						vectorEffect="non-scaling-stroke"
					/>
					<polyline
						points="0,77 53,68 106,70 160,59 213,62 266,48 320,43"
						fill="none"
						stroke="#47c7a1"
						strokeWidth="1.75"
						vectorEffect="non-scaling-stroke"
					/>
				</svg>
			</div>
		);
	if (type === "people")
		return (
			<div className="flex w-full -space-x-3" aria-hidden="true">
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
	if (type === "calendar")
		return (
			<div
				className="w-full overflow-hidden rounded-xl border border-french_gray-200 bg-white/80 dark:border-paynes_gray-700 dark:bg-outer_space-400/70"
				aria-hidden="true"
			>
				<div className="flex items-center justify-between border-b border-french_gray-200 px-3 py-2.5 dark:border-paynes_gray-700">
					<div className="flex items-center gap-1.5">
						<span className="grid size-6 place-items-center rounded-md border border-french_gray-200 text-paynes_gray-400 dark:border-paynes_gray-700">
							<ChevronLeft size={11} />
						</span>
						<span className="grid size-6 place-items-center rounded-md border border-french_gray-200 text-paynes_gray-400 dark:border-paynes_gray-700">
							<ChevronRight size={11} />
						</span>
						<strong className="ml-1 text-[10px] text-outer_space-900 dark:text-platinum-50">
							May 2025
						</strong>
					</div>
					<div className="flex rounded-md border border-french_gray-200 bg-platinum-50 p-0.5 text-[8px] font-medium dark:border-paynes_gray-700 dark:bg-outer_space-500">
						<span className="rounded-sm bg-blue_munsell-500 px-2 py-1 text-white">
							Month
						</span>
						<span className="px-2 py-1 text-paynes_gray-400">Day</span>
					</div>
				</div>
				<div className="grid grid-cols-7 border-b border-french_gray-200 text-center text-[8px] font-semibold text-paynes_gray-400 dark:border-paynes_gray-700">
					{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
						<span key={day} className="py-2">
							{day.slice(0, 1)}
							<span className="hidden sm:inline">{day.slice(1)}</span>
						</span>
					))}
				</div>
				<div className="grid grid-cols-7 border-l border-french_gray-200 dark:border-paynes_gray-700">
					{[11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(
						(day) => (
							<div
								key={day}
								className="min-h-12 border-b border-r border-french_gray-200 p-1 dark:border-paynes_gray-700 sm:min-h-14 sm:p-1.5"
							>
								<span
									className={`grid size-4 place-items-center rounded-full text-[8px] ${day === 14 ? "bg-blue_munsell-500 font-semibold text-white" : "text-paynes_gray-500 dark:text-french_gray-400"}`}
								>
									{day}
								</span>
								{day === 13 ? (
									<span className="mt-1 block truncate rounded-sm bg-amber-50 px-1 py-0.5 text-[7px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
										Review
									</span>
								) : null}
								{day === 14 ? (
									<span className="mt-1 block truncate rounded-sm bg-blue_munsell-50 px-1 py-0.5 text-[7px] font-medium text-blue_munsell-600 dark:bg-blue_munsell-950/35 dark:text-blue_munsell-300">
										Launch
									</span>
								) : null}
								{day === 21 ? (
									<span className="mt-1 block truncate rounded-sm bg-emerald-50 px-1 py-0.5 text-[7px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
										Sync
									</span>
								) : null}
							</div>
						),
					)}
				</div>
			</div>
		);
	if (type === "shield")
		return (
			<div className="w-full space-y-2" aria-hidden="true">
				{["Workspace scoped", "Role protected", "Private by default"].map(
					(label) => (
						<div
							key={label}
							className="flex items-center gap-2 rounded-lg border border-french_gray-200 bg-white/70 px-3 py-2 text-[10px] font-medium text-paynes_gray-500 dark:border-paynes_gray-700 dark:bg-outer_space-400/70 dark:text-french_gray-400"
						>
							<span className="grid size-4 place-items-center rounded-full bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-950/50 dark:text-blue_munsell-300">
								<Check size={10} strokeWidth={3} />
							</span>
							{label}
						</div>
					),
				)}
			</div>
		);
	if (type === "flow")
		return (
			<div
				className="w-full overflow-hidden rounded-xl border border-french_gray-200 bg-white/75 dark:border-paynes_gray-700 dark:bg-outer_space-400/70"
				aria-hidden="true"
			>
				<div className="flex items-center justify-between border-b border-french_gray-200 px-3 py-2.5 dark:border-paynes_gray-700">
					<div className="flex items-center gap-2">
						<strong className="text-[10px] text-outer_space-900 dark:text-platinum-50">
							Members
						</strong>
						<span className="rounded-full bg-blue_munsell-50 px-1.5 py-0.5 text-[8px] font-semibold text-blue_munsell-600 dark:bg-blue_munsell-950/40 dark:text-blue_munsell-300">
							4
						</span>
					</div>
					<span className="flex items-center gap-1 rounded-md bg-blue_munsell-500 px-2 py-1 text-[8px] font-semibold text-white">
						<UserPlus size={10} /> Invite member
					</span>
				</div>
				<div className="grid grid-cols-[minmax(0,1fr)_4rem_1rem] gap-2 border-b border-french_gray-200 px-3 py-1.5 text-[7px] font-semibold uppercase tracking-wide text-paynes_gray-400 dark:border-paynes_gray-700">
					<span>Member</span>
					<span>Role</span>
					<span />
				</div>
				<div className="divide-y divide-french_gray-200 dark:divide-paynes_gray-700">
					{[
						{
							initials: "JL",
							name: "Jamie Lee",
							email: "jamie@kanvas.com",
							role: "Admin",
							avatar: "bg-[#9187f5]",
							badge:
								"bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
						},
						{
							initials: "MR",
							name: "Mike Ross",
							email: "mike@kanvas.com",
							role: "Member",
							avatar: "bg-[#72bada]",
							badge:
								"bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-950/40 dark:text-blue_munsell-300",
						},
						{
							initials: "SC",
							name: "Sarah Chen",
							email: "sarah@kanvas.com",
							role: "Viewer",
							avatar: "bg-[#76caa5]",
							badge:
								"bg-emerald-50 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-300",
						},
					].map((member) => (
						<div
							key={member.email}
							className="grid grid-cols-[minmax(0,1fr)_4rem_1rem] items-center gap-2 px-3 py-2"
						>
							<span className="flex min-w-0 items-center gap-2">
								<i
									className={`grid size-6 shrink-0 place-items-center rounded-full text-[7px] font-bold not-italic text-white ${member.avatar}`}
								>
									{member.initials}
								</i>
								<span className="min-w-0">
									<strong className="block truncate text-[9px] text-outer_space-900 dark:text-platinum-50">
										{member.name}
									</strong>
									<small className="block truncate text-[7px] text-paynes_gray-400">
										{member.email}
									</small>
								</span>
							</span>
							<span
								className={`w-fit rounded-md px-1.5 py-1 text-[7px] font-medium ${member.badge}`}
							>
								{member.role}
							</span>
							<MoreHorizontal size={11} className="text-paynes_gray-400" />
						</div>
					))}
				</div>
			</div>
		);
	return (
		<div className="grid w-full grid-cols-3 gap-2" aria-hidden="true">
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
			className="relative overflow-hidden border-y border-french_gray-200 bg-platinum-50/60 px-4 py-24 sm:px-6 sm:py-28 lg:px-8 dark:border-paynes_gray-800 dark:bg-outer_space-800"
		>
			<div
				className="pointer-events-none absolute -left-40 top-20 size-96 rounded-full bg-blue_munsell-100/40 blur-3xl dark:bg-blue_munsell-950/15"
				aria-hidden="true"
			/>
			<div
				className="pointer-events-none absolute -right-32 bottom-10 size-80 rounded-full bg-[#e989b8]/10 blur-3xl"
				aria-hidden="true"
			/>
			<div className="relative mx-auto max-w-7xl">
				<Reveal className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
					<div>
						<p className="inline-flex items-center gap-2 rounded-full border border-blue_munsell-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-blue_munsell-600 shadow-sm dark:border-blue_munsell-800 dark:bg-outer_space-500/80 dark:text-blue_munsell-300">
							Built for visual momentum
						</p>
						<h2 className="mt-4 max-w-3xl text-balance text-3xl font-bold tracking-[-0.03em] text-outer_space-900 sm:text-5xl dark:text-platinum-50">
							Structure when you need it. Space when you don’t.
						</h2>
					</div>
					<div className="lg:pb-1">
						<p className="max-w-xl text-base leading-7 text-paynes_gray-500 dark:text-french_gray-400">
							Kanvas keeps projects, people, deadlines, and decisions visible
							without turning your workspace into noise.
						</p>
						<a
							href="/sign-up"
							className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue_munsell-600 transition-colors hover:text-blue_munsell-700 dark:text-blue_munsell-300 dark:hover:text-blue_munsell-200"
						>
							Build your workspace <ArrowRight size={15} />
						</a>
					</div>
				</Reveal>
				<div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{features.map((feature, index) => (
						<FeatureMotion
							key={feature.title}
							delay={index * 0.065}
							className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-french_gray-200 bg-white/85 p-6 shadow-sm backdrop-blur-sm dark:border-paynes_gray-800 dark:bg-outer_space-500/90 ${feature.layout}`}
						>
							<div
								className={`absolute inset-x-8 top-0 h-px bg-linear-to-r ${feature.accent}`}
							/>
							<div className="flex items-start gap-4">
								<span
									className={`grid size-11 shrink-0 place-items-center rounded-2xl ${feature.tone}`}
								>
									<feature.icon size={19} />
								</span>
								<div className="min-w-0 pt-0.5">
									<h3 className="text-lg font-semibold text-outer_space-900 dark:text-platinum-50">
										{feature.title}
									</h3>
									<p className="mt-1.5 max-w-lg text-sm leading-6 text-paynes_gray-500 dark:text-french_gray-400">
										{feature.copy}
									</p>
								</div>
							</div>
							<div className="mt-6 flex w-full items-end">
								<FeatureVisual type={feature.visual} />
							</div>
						</FeatureMotion>
					))}
				</div>
			</div>
		</section>
	);
}
