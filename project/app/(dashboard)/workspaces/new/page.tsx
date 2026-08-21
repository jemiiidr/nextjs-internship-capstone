import { CreateOrganization } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "New workspace" };

export default function NewWorkspacePage() {
	return (
		<div className="space-y-6">
			<Link
				href="/workspaces"
				className="inline-flex items-center gap-1.5 text-sm font-medium text-paynes_gray-500 hover:text-blue_munsell-600"
			>
				<ArrowLeft size={15} /> Workspaces
			</Link>
			<div>
				<h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
					Create a workspace
				</h1>
				<p className="mt-2 text-paynes_gray-500">
					Create the Clerk Organization that will own this workspace’s projects
					and permissions.
				</p>
			</div>
			<div className="max-w-xl overflow-hidden rounded-3xl border border-french_gray-300 bg-white p-3 dark:border-paynes_gray-800 dark:bg-outer_space-500">
				<CreateOrganization
					routing="hash"
					afterCreateOrganizationUrl="/dashboard"
				/>
			</div>
		</div>
	);
}
