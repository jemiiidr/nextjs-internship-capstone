import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
	className,
	...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
	return (
		<textarea
			className={cn(
				"flex min-h-24 w-full resize-y rounded-lg border border-french_gray-300 bg-white px-3 py-2 text-sm text-outer_space-500 outline-none transition placeholder:text-paynes_gray-500 focus:border-blue_munsell-500 focus:ring-2 focus:ring-blue_munsell-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500 dark:placeholder:text-french_gray-400",
				className,
			)}
			{...props}
		/>
	);
}
