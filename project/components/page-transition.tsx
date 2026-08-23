"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageTransition({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const pathname = usePathname();
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			key={pathname}
			initial={reduceMotion ? false : { opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
			className={cn("min-w-0", className)}
		>
			{children}
		</motion.div>
	);
}
