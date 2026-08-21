import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { FloworaLogo } from "@/components/flowora-logo";

export const metadata: Metadata = { title: "Create account" };
export default function SignUpPage() {
	return (
		<main className="flowora-soft-gradient grid min-h-screen place-items-center p-4">
			<div className="w-full max-w-md">
				<div className="mb-6 flex justify-center">
					<FloworaLogo />
				</div>
				<div className="overflow-hidden rounded-3xl border border-french_gray-300 bg-white p-2 shadow-xl dark:border-paynes_gray-800 dark:bg-outer_space-500">
					<SignUp
						routing="path"
						path="/sign-up"
						signInUrl="/sign-in"
						fallbackRedirectUrl="/workspaces"
					/>
				</div>
				<p className="mt-5 text-center text-xs text-paynes_gray-500">
					Back to{" "}
					<Link href="/" className="font-semibold text-blue_munsell-600">
						Flowora home
					</Link>
				</p>
			</div>
		</main>
	);
}
