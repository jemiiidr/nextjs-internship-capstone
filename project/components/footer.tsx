import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-french_gray-300 bg-outer_space-900 px-4 py-10 text-french_gray-400 dark:border-paynes_gray-400">
			<div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<Link href="/" className="font-semibold text-white">
						ProjectFlow
					</Link>
					<p className="mt-1 text-sm">
						A full-stack capstone project management workspace.
					</p>
				</div>
				<div className="flex gap-5 text-sm">
					<Link href="/sign-in" className="hover:text-white">
						Sign in
					</Link>
					<Link href="/sign-up" className="hover:text-white">
						Create account
					</Link>
					<a href="#features" className="hover:text-white">
						Features
					</a>
				</div>
				<p className="text-sm">© {new Date().getFullYear()} ProjectFlow</p>
			</div>
		</footer>
	);
}
