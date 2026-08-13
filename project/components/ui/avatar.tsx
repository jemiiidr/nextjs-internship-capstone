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
				"relative inline-flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue_munsell-500 text-xs font-semibold text-white",
				className,
			)}
			title={name}
		>
			{src ? (
				<Image src={src} alt="" fill sizes="32px" className="object-cover" />
			) : (
				initials(name)
			)}
		</span>
	);
}
