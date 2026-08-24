import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { requireWorkspaceContext } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
	const context = await requireWorkspaceContext();
	return <div className="space-y-7">
		<header className="mx-auto w-full max-w-4xl"><p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">Account & workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">Settings</h1><p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">Manage your profile, security, session, and active workspace without leaving Kanvas.</p></header>
		<SettingsPanel user={{ id: context.user.id, name: context.user.name, email: context.user.email, avatarUrl: context.user.avatarUrl }} />
	</div>;
}
