import Link from "next/link";
import { FloworaLogo } from "@/components/flowora-logo";

export function Footer() {
	return (
		<footer className="border-t border-french_gray-300 bg-white px-4 py-10 sm:px-6 lg:px-8 dark:border-paynes_gray-800 dark:bg-outer_space-800">
			<div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<FloworaLogo />
					<p className="mt-2 text-xs text-paynes_gray-500">
						Plan clearly. Move work forward.
					</p>
				</div>
				<div className="flex gap-5 text-sm text-paynes_gray-500">
					<Link href="#features">Features</Link>
					<Link href="/sign-in">Log in</Link>
					<Link href="/sign-up">Get started</Link>
				</div>
				<p className="text-xs text-paynes_gray-400">
					© {new Date().getFullYear()} Flowora
				</p>
			</div>
		</footer>
	);
}
