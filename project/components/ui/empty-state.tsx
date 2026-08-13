import type { ReactNode } from "react";

export function EmptyState({
	icon,
	title,
	description,
	action,
}: {
	icon?: ReactNode;
	title: string;
	description: string;
	action?: ReactNode;
}) {
	return (
		<div className="rounded-xl border border-dashed border-french_gray-300 bg-white px-6 py-12 text-center dark:border-paynes_gray-400 dark:bg-outer_space-500">
			{icon ? (
				<div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-xl bg-platinum-700 text-blue_munsell-500 dark:bg-outer_space-300">
					{icon}
				</div>
			) : null}
			<h2 className="font-semibold text-outer_space-500 dark:text-platinum-500">
				{title}
			</h2>
			<p className="mx-auto mt-1 max-w-md text-sm text-paynes_gray-500 dark:text-french_gray-400">
				{description}
			</p>
			{action ? <div className="mt-5">{action}</div> : null}
		</div>
	);
}
