import Link from "next/link";
import { cn } from "@/lib/utils";

export function FloworaMark({ className }: { className?: string }) {
	return (
		<span
			className={cn("relative inline-block size-9 shrink-0", className)}
			aria-hidden="true"
		>
			<span className="absolute left-1 top-0 h-6 w-3 rotate-0 rounded-full bg-[#9187f5]" />
			<span className="absolute right-0 top-1.5 h-3 w-6 rounded-full bg-[#f5ad78]" />
			<span className="absolute bottom-0 left-1 h-6 w-3 rounded-full bg-[#72bada]" />
			<span className="absolute bottom-1 right-1 h-3 w-5 rotate-[-28deg] rounded-full bg-[#76caa5]" />
		</span>
	);
}

export function FloworaLogo({
	href = "/",
	compact = false,
}: {
	href?: string;
	compact?: boolean;
}) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-2.5 font-semibold tracking-tight text-outer_space-900 dark:text-platinum-50"
		>
			<FloworaMark />
			{compact ? null : <span className="text-lg">Flowora</span>}
		</Link>
	);
}
