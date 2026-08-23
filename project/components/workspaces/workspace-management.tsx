"use client";

import { Building2, Loader2, Plus, ShieldCheck, Users } from "lucide-react";
import { useActionState, useState } from "react";
import { updateWorkspaceAction } from "@/app/actions/workspaces";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";
import { WorkspaceActivateButton } from "@/components/workspaces/workspace-activate-button";
import type { ActionResult, UserSummary, WorkspaceSummary } from "@/types";

const initialState: ActionResult = { success: false, message: "" };

export function WorkspaceManagement({
	workspaces,
	previews,
	activeWorkspaceId,
	initialCreateOpen = false,
}: {
	workspaces: WorkspaceSummary[];
	previews: Record<string, UserSummary[]>;
	activeWorkspaceId: string | null;
	initialCreateOpen?: boolean;
}) {
	const [createOpen, setCreateOpen] = useState(initialCreateOpen);
	const [selected, setSelected] = useState<WorkspaceSummary | null>(null);
	const [state, action, pending] = useActionState(
		updateWorkspaceAction,
		initialState,
	);

	return (
		<>
			<div className="flex justify-end">
				<Button onClick={() => setCreateOpen(true)}>
					<Plus size={16} /> New workspace
				</Button>
			</div>
			{workspaces.length === 0 ? (
				<div className="flowora-panel rounded-3xl border border-dashed border-blue_munsell-200 bg-white p-10 text-center dark:border-blue_munsell-800 dark:bg-outer_space-500">
					<span className="mx-auto grid size-14 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
						<Building2 />
					</span>
					<h2 className="mt-4 text-xl font-semibold text-outer_space-900 dark:text-platinum-50">
						Create your first workspace
					</h2>
					<p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-paynes_gray-500">
						Projects are isolated by workspace. Create one to start a board and
						invite collaborators.
					</p>
					<Button className="mt-5" onClick={() => setCreateOpen(true)}>
						Create workspace <Plus size={15} />
					</Button>
				</div>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{workspaces.map((workspace, index) => {
						const active = workspace.id === activeWorkspaceId;
						const accents = [
							"from-[#7467f0]/18 to-[#72bada]/12",
							"from-[#e989b8]/18 to-[#f5ad78]/12",
							"from-[#76caa5]/18 to-[#e9be65]/12",
						];
						return (
							<Card
								key={workspace.id}
								className="cursor-pointer overflow-hidden transition hover:-translate-y-0.5 hover:border-blue_munsell-300"
								onClick={() => setSelected(workspace)}
							>
								<div
									className={`h-2 bg-gradient-to-r ${accents[index % accents.length]}`}
								/>
								<CardContent className="p-5">
									<div className="flex items-start justify-between gap-3">
										<span className="grid size-11 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
											<Building2 size={20} />
										</span>
										{active ? (
											<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
												Active
											</span>
										) : null}
									</div>
									<h2 className="mt-4 truncate text-lg font-semibold text-outer_space-900 dark:text-platinum-50">
										{workspace.name}
									</h2>
									<p className="mt-1 text-xs text-paynes_gray-400">
										{workspace.slug ? `@${workspace.slug}` : workspace.id}
									</p>
									<div className="mt-5 grid grid-cols-2 gap-2 text-sm text-paynes_gray-500">
										<span className="flex items-center gap-2">
											<Users size={15} /> {workspace.memberCount} members
										</span>
										<span className="flex items-center gap-2 capitalize">
											<ShieldCheck size={15} /> {workspace.role}
										</span>
									</div>
									<div className="mt-5 flex items-center justify-between">
										<AvatarStack
											users={previews[workspace.id] ?? []}
											total={workspace.memberCount}
										/>
										<WorkspaceActivateButton
											workspaceId={workspace.id}
											active={active}
										/>
									</div>
								</CardContent>
							</Card>
						);
					})}
				</div>
			)}

			<Modal
				open={createOpen}
				onClose={() => setCreateOpen(false)}
				title="Create a workspace"
				description="Create a separate space for a team, its projects, and its permissions."
			>
				<CreateWorkspaceForm embedded />
			</Modal>
			<Modal
				open={Boolean(selected)}
				onClose={() => setSelected(null)}
				title={selected?.name ?? "Workspace"}
				description="View workspace details and manage settings available to your role."
			>
				{selected ? (
					<div key={selected.id} className="space-y-5">
						<div className="grid grid-cols-2 gap-3">
							<div className="rounded-xl bg-platinum-100 p-3 dark:bg-outer_space-400">
								<p className="text-xs text-paynes_gray-500">Members</p>
								<p className="mt-1 font-semibold">{selected.memberCount}</p>
							</div>
							<div className="rounded-xl bg-platinum-100 p-3 dark:bg-outer_space-400">
								<p className="text-xs text-paynes_gray-500">Your role</p>
								<p className="mt-1 font-semibold capitalize">{selected.role}</p>
							</div>
						</div>
						{selected.role === "admin" && selected.id === activeWorkspaceId ? (
							<form action={action} className="space-y-3">
								<input type="hidden" name="workspaceId" value={selected.id} />
								<div className="space-y-2">
									<Label htmlFor={`workspace-${selected.id}`}>
										Workspace name
									</Label>
									<Input
										id={`workspace-${selected.id}`}
										name="name"
										defaultValue={selected.name}
										minLength={2}
										maxLength={100}
										required
									/>
								</div>
								{state.message ? (
									<p
										className={
											state.success
												? "text-sm text-emerald-600"
												: "text-sm text-red-600"
										}
									>
										{state.message}
									</p>
								) : null}
								<Button disabled={pending}>
									{pending ? (
										<Loader2 size={16} className="animate-spin" />
									) : null}{" "}
									Save changes
								</Button>
							</form>
						) : (
							<p className="rounded-xl bg-platinum-100 p-3 text-sm text-paynes_gray-500 dark:bg-outer_space-400">
								{selected.role !== "admin"
									? "Only workspace administrators can change workspace settings."
									: "Activate this workspace to edit its settings."}
							</p>
						)}
					</div>
				) : null}
			</Modal>
		</>
	);
}
