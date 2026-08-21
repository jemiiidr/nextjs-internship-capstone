import Image from "next/image";
import { cn, initials } from "@/lib/utils";

export function Avatar({
	name,
	src,
	className,
}: {
	name: string;
	src?: string | null;
	className?: string;
}) {
	return (
		<span
			className={cn(
				"relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#9187f5] to-[#72bada] text-xs font-semibold text-white",
				className,
			)}
			title={name}
		>
			{src ? (
				<Image
					src={src}
					alt={name}
					fill
					sizes="40px"
					className="object-cover"
				/>
			) : (
				initials(name)
			)}
		</span>
	);
}
