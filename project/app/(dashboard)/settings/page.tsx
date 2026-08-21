import { OrganizationProfile, UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";
import { requireWorkspaceContext } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
	const context = await requireWorkspaceContext();
	return (
		<div className="space-y-7">
			<header>
				<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
					Account & workspace
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
					Settings
				</h1>
				<p className="mt-2 text-paynes_gray-500">
					Manage your personal profile and the active Clerk Organization from
					one place.
				</p>
			</header>
			<div className="grid gap-6 2xl:grid-cols-2">
				<section className="min-w-0 overflow-x-auto rounded-2xl border border-french_gray-300 bg-white p-2 dark:border-paynes_gray-800 dark:bg-outer_space-500">
					<h2 className="px-3 pb-2 pt-3 font-semibold text-outer_space-900 dark:text-platinum-50">
						Personal profile
					</h2>
					<UserProfile routing="hash" />
				</section>
				<section className="min-w-0 overflow-x-auto rounded-2xl border border-french_gray-300 bg-white p-2 dark:border-paynes_gray-800 dark:bg-outer_space-500">
					<h2 className="px-3 pb-2 pt-3 font-semibold text-outer_space-900 dark:text-platinum-50">
						Workspace & members
					</h2>
					<OrganizationProfile routing="hash" />
				</section>
			</div>
			<p className="text-xs text-paynes_gray-400">
				Active workspace: {context.workspaceId}
			</p>
		</div>
	);
}
