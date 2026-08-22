import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { FloworaLogo } from "@/components/flowora-logo";

export const metadata: Metadata = { title: "Join workspace" };

export default function AcceptInvitationPage() {
	return (
		<main className="flowora-soft-gradient grid min-h-screen place-items-center p-4">
			<div className="w-full max-w-md">
				<div className="mb-6 flex justify-center">
					<FloworaLogo />
				</div>
				<div className="mb-4 text-center">
					<h1 className="text-2xl font-bold text-outer_space-900 dark:text-platinum-50">
						Join your team on Flowora
					</h1>
					<p className="mt-2 text-sm text-paynes_gray-500">
						Accept your workspace invitation to start collaborating.
					</p>
				</div>
				<div className="overflow-hidden rounded-3xl border border-french_gray-300 bg-white p-2 shadow-xl dark:border-paynes_gray-800 dark:bg-outer_space-500">
					<SignUp
						routing="hash"
						signInUrl="/sign-in"
						forceRedirectUrl="/team"
					/>
				</div>
			</div>
		</main>
	);
}
