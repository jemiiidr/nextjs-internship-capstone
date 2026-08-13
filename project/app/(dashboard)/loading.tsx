export default function DashboardLoading() {
	return (
		<div className="space-y-6">
			<div className="h-10 w-56 animate-pulse rounded-lg bg-platinum-200 dark:bg-outer_space-400" />
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{["a", "b", "c", "d"].map((id) => (
					<div
						key={id}
						className="h-28 animate-pulse rounded-xl bg-platinum-200 dark:bg-outer_space-400"
					/>
				))}
			</div>
			<div className="h-80 animate-pulse rounded-xl bg-platinum-200 dark:bg-outer_space-400" />
		</div>
	);
}
