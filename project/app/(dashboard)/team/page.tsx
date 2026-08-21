import { ExternalLink, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { requireWorkspaceContext } from "@/lib/auth";
import { getWorkspaceMembers, getWorkspaceSummary } from "@/lib/workspaces";

export const metadata: Metadata = { title: "Team" };

export default async function TeamPage() {
	const context = await requireWorkspaceContext();
	const [workspace, members] = await Promise.all([
		getWorkspaceSummary(context.workspaceId, context.workspaceRoleKey),
		getWorkspaceMembers(context.workspaceId),
	]);
	return (
		<div className="space-y-7">
			<header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p className="text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						{workspace.name}
					</p>
					<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Team
					</h1>
					<p className="mt-2 max-w-2xl text-paynes_gray-500">
						Workspace membership and access roles come directly from your Clerk
						Organization.
					</p>
				</div>
				<Link
					href="/settings"
					className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue_munsell-600"
				>
					Manage in settings <ExternalLink size={14} />
				</Link>
			</header>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{members.map((member) => (
					<Card key={member.id}>
						<CardContent className="flex items-center gap-3 p-5">
							<Avatar
								name={member.name}
								src={member.avatarUrl}
								className="size-11"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate font-semibold text-outer_space-900 dark:text-platinum-50">
									{member.name}
								</p>
								<p className="truncate text-sm text-paynes_gray-500">
									{member.email}
								</p>
							</div>
							<Badge className="capitalize">
								<ShieldCheck size={12} /> {member.role}
							</Badge>
						</CardContent>
					</Card>
				))}
			</div>
			{members.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-french_gray-300 p-10 text-center">
					<Users className="mx-auto text-paynes_gray-400" />
					<p className="mt-3 text-sm text-paynes_gray-500">
						No workspace members returned by Clerk.
					</p>
				</div>
			) : null}
		</div>
	);
}
