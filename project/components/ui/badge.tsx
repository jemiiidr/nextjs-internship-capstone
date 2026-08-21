import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
	className,
	...props
}: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border border-french_gray-300 bg-platinum-100 px-2.5 py-1 text-xs font-medium text-paynes_gray-600 dark:border-paynes_gray-800 dark:bg-outer_space-400 dark:text-french_gray-300",
				className,
			)}
			{...props}
		/>
	);
}
