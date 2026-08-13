export default function ProjectsLoading() {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div className="space-y-2">
					<div className="h-8 w-48 animate-pulse rounded-lg bg-platinum-200 dark:bg-outer_space-400" />
					<div className="h-4 w-72 max-w-full animate-pulse rounded bg-platinum-200 dark:bg-outer_space-400" />
				</div>
				<div className="h-10 w-36 animate-pulse rounded-lg bg-platinum-200 dark:bg-outer_space-400" />
			</div>
			<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
				{[
					"project-1",
					"project-2",
					"project-3",
					"project-4",
					"project-5",
					"project-6",
				].map((id) => (
					<div
						key={id}
						className="h-48 animate-pulse rounded-2xl border border-platinum-300 bg-white dark:border-outer_space-400 dark:bg-outer_space-500"
					/>
				))}
			</div>
		</div>
	);
}
