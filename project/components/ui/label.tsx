import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({
	className,
	...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
	return (
		<label
			className={cn(
				"text-sm font-medium text-outer_space-500 dark:text-platinum-500",
				className,
			)}
			{...props}
		/>
	);
}
