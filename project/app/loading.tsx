import { KanvasMark } from "@/components/kanvas-logo";

export default function RootLoading() {
	return (
		<main className="grid min-h-screen place-items-center bg-white px-6 dark:bg-outer_space-600">
			<div
				className="flex flex-col items-center gap-4"
				role="status"
				aria-label="Loading Kanvas"
			>
				<KanvasMark className="size-14 animate-pulse" />
				<p className="text-sm font-medium text-paynes_gray-500 dark:text-french_gray-300">
					Loading Kanvas…
				</p>
			</div>
		</main>
	);
}
