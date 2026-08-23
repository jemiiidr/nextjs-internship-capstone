"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

export function LandingExperience({ children }: { children: ReactNode }) {
	return (
		<ReactLenis
			root
			options={{ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.9 }}
		>
			<MotionConfig reducedMotion="user">{children}</MotionConfig>
		</ReactLenis>
	);
}
