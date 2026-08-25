"use client";

import {
	motion,
	useMotionTemplate,
	useMotionValue,
	useReducedMotion,
	useScroll,
	useSpring,
	useTransform,
} from "motion/react";
import { type ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

export function HeroScene({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const ref = useRef<HTMLElement>(null);
	const reduceMotion = useReducedMotion();
	const pointerX = useMotionValue(50);
	const pointerY = useMotionValue(28);
	const smoothX = useSpring(pointerX, {
		stiffness: 110,
		damping: 24,
		mass: 0.5,
	});
	const smoothY = useSpring(pointerY, {
		stiffness: 110,
		damping: 24,
		mass: 0.5,
	});
	const glow = useMotionTemplate`radial-gradient(560px circle at ${smoothX}% ${smoothY}%, color-mix(in srgb, var(--brand-color) 24%, transparent), transparent 68%)`;
	const accentX = useTransform(smoothX, [0, 100], [-32, 32]);
	const accentY = useTransform(smoothY, [0, 100], [-20, 20]);

	return (
		<motion.section
			ref={ref}
			className={className}
			onPointerMove={(event) => {
				if (reduceMotion || event.pointerType === "touch") return;
				const bounds = ref.current?.getBoundingClientRect();
				if (!bounds) return;
				pointerX.set(((event.clientX - bounds.left) / bounds.width) * 100);
				pointerY.set(((event.clientY - bounds.top) / bounds.height) * 100);
			}}
			onPointerLeave={() => {
				pointerX.set(50);
				pointerY.set(28);
			}}
		>
			<motion.div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 z-0 opacity-80 dark:opacity-55"
				style={{ backgroundImage: glow }}
			/>
			<motion.div
				aria-hidden="true"
				className="pointer-events-none absolute left-[14%] top-36 z-0 size-44 rounded-full bg-[#e989b8]/20 blur-3xl dark:bg-[#e989b8]/10"
				style={reduceMotion ? undefined : { x: accentX, y: accentY }}
			/>
			{children}
		</motion.section>
	);
}

export function Reveal({
	children,
	className,
	delay = 0,
}: {
	children: ReactNode;
	className?: string;
	delay?: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 22 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.18 }}
			transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

export function Parallax({
	children,
	className,
	distance = 42,
}: {
	children: ReactNode;
	className?: string;
	distance?: number;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start end", "end start"],
	});
	const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
	return (
		<motion.div ref={ref} style={{ y }} className={className}>
			{children}
		</motion.div>
	);
}

export function FeatureMotion({
	children,
	className,
	delay = 0,
}: {
	children: ReactNode;
	className?: string;
	delay?: number;
}) {
	return (
		<motion.article
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15 }}
			whileHover={{ y: -5, rotate: 0.15 }}
			transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
			className={cn(
				"shadow-[inset_0_1px_0_rgba(255,255,255,.7)] transition-colors hover:border-blue_munsell-400 hover:shadow-[0_24px_60px_rgba(31,38,64,.1)]",
				className,
			)}
		>
			{children}
		</motion.article>
	);
}

const spectrum =
	"linear-gradient(90deg,#9187f5,#e989b8,#f29586,#e9be65,#76caa5,#72bada,#9187f5)";

export function SpectrumAura() {
	return (
		<div className="relative h-1 bg-blue_munsell-500" aria-hidden="true">
			<motion.div
				className="absolute inset-0 bg-[length:240%_100%]"
				style={{ backgroundImage: spectrum }}
				animate={{ backgroundPositionX: ["0%", "-240%"] }}
				transition={{ duration: 5, ease: "linear", repeat: Infinity }}
			/>
		</div>
	);
}

export function FloatingOrb({
	className,
	delay = 0,
}: {
	className?: string;
	delay?: number;
}) {
	return (
		<motion.div
			aria-hidden="true"
			className={cn(
				"pointer-events-none absolute rounded-full border border-blue_munsell-400/20",
				className,
			)}
			animate={{ x: [0, 16, 0], y: [0, -12, 0], rotate: [0, 8, 0] }}
			transition={{ duration: 12, delay, repeat: Infinity, ease: "easeInOut" }}
		/>
	);
}
