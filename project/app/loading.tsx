export default function RootLoading() {
	return (
		<main className="grid min-h-screen place-items-center bg-white px-6 dark:bg-outer_space-600">
			<div className="flex flex-col items-center gap-4" role="status" aria-label="Loading Flowora">
				<div className="relative size-12">
					<div className="absolute inset-0 animate-spin rounded-full border-2 border-platinum-300 border-t-blue_munsell-500 dark:border-paynes_gray-500 dark:border-t-blue_munsell-300" />
					<div className="absolute inset-3 rounded-full bg-blue_munsell-500" />
				</div>
				<p className="text-sm font-medium text-paynes_gray-500 dark:text-french_gray-300">Loading Flowora…</p>
			</div>
		</main>
	);
}
