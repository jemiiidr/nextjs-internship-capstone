import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";

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
			<div className="max-w-xl"><CreateWorkspaceForm /></div>
		</div>
	);
}
