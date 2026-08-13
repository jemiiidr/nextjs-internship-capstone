import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-blue_munsell-500 text-white hover:bg-blue_munsell-600",
				secondary:
					"border border-french_gray-300 bg-white text-outer_space-500 hover:bg-platinum-700 dark:border-paynes_gray-400 dark:bg-outer_space-400 dark:text-platinum-500 dark:hover:bg-paynes_gray-400",
				ghost:
					"text-paynes_gray-500 hover:bg-platinum-700 hover:text-outer_space-500 dark:text-french_gray-400 dark:hover:bg-paynes_gray-400 dark:hover:text-platinum-500",
				danger: "bg-red-600 text-white hover:bg-red-700",
			},
			size: {
				default: "h-10 px-4 py-2",
				sm: "h-8 rounded-md px-3 text-xs",
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
