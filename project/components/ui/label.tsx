import type { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LabelProps
	extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor" | "children"> {
	htmlFor: string;
	children: ReactNode;
}

export function Label({ className, htmlFor, children, ...props }: LabelProps) {
	return (
		<label
			htmlFor={htmlFor}
			className={cn(
				"text-sm font-medium text-outer_space-500 dark:text-platinum-500",
				className,
			)}
			{...props}
		>
			{children}
		</label>
	);
}
