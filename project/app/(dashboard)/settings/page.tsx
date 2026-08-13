import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };
export default function SettingsPage() {
	return (
		<div className="space-y-7">
			<header>
				<h1 className="text-3xl font-bold text-outer_space-900 dark:text-platinum-50">
					Account settings
				</h1>
				<p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">
					Manage your Clerk profile, email addresses, password, and active
					sessions.
				</p>
			</header>
			<div className="overflow-x-auto">
				<UserProfile routing="hash" />
			</div>
		</div>
	);
}
