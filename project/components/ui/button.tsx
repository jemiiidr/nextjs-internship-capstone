import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"bg-blue_munsell-500 text-white shadow-sm shadow-blue_munsell-500/15 hover:bg-blue_munsell-600 hover:-translate-y-px",
				secondary:
					"border border-french_gray-300 bg-white text-outer_space-500 shadow-sm hover:bg-platinum-100 dark:border-paynes_gray-700 dark:bg-outer_space-400 dark:text-platinum-500 dark:hover:bg-outer_space-300",
				ghost:
					"text-paynes_gray-500 hover:bg-platinum-200 hover:text-outer_space-500 dark:text-french_gray-400 dark:hover:bg-outer_space-400 dark:hover:text-platinum-500",
				danger:
					"border border-rose-200 bg-rose-50 text-rose-700 shadow-sm hover:border-rose-300 hover:bg-rose-100 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-8 rounded-lg px-3 text-xs",
				icon: "size-10 p-0",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
);

export interface ButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {}

export function Button({
	className,
	variant,
	size,
	type = "button",
	...props
}: ButtonProps) {
	return (
		<button
			type={type}
			className={cn(buttonVariants({ variant, size }), className)}
			{...props}
		/>
	);
}
