import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
	return (
		<span
			className={cn(
				"inline-flex items-center rounded-full border border-french_gray-300 bg-platinum-700 px-2 py-0.5 text-xs font-medium text-paynes_gray-500 dark:border-paynes_gray-400 dark:bg-outer_space-300 dark:text-french_gray-400",
				className,
			)}
			{...props}
		/>
	)
}
