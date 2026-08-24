import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function KanvasMark({ className }: { className?: string }) {
	return (
		<span className={cn("relative inline-block size-10 shrink-0 overflow-hidden rounded-xl", className)}>
			<Image src="/logo.svg" alt="" fill sizes="40px" className="object-contain" priority />
		</span>
	);
}

export function KanvasLogo({ href = "/", compact = false }: { href?: string; compact?: boolean }) {
	return (
		<Link href={href} aria-label="Kanvas home" className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-outer_space-900 dark:text-platinum-50">
			<KanvasMark />
			{compact ? null : <span className="text-lg">Kanvas</span>}
		</Link>
	);
}
