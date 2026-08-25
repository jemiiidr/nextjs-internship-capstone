"use client";

import { useOrganization } from "@clerk/nextjs";
import {
	Building2,
	FolderKanban,
	Loader2,
	MoreHorizontal,
	Plus,
	Upload,
	Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { updateWorkspaceAction } from "@/app/actions/workspaces";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { CreateWorkspaceForm } from "@/components/workspaces/create-workspace-form";
import { WorkspaceActivateButton } from "@/components/workspaces/workspace-activate-button";
import { hasPermission } from "@/lib/rbac";
import type { ActionResult, WorkspaceMember, WorkspaceSummary } from "@/types";

const initialState: ActionResult = { success: false, message: "" };

export function WorkspaceManagement({
	workspaces,
	membersByWorkspace,
	projectCounts,
	activeWorkspaceId,
	initialCreateOpen = false,
}: {
	workspaces: WorkspaceSummary[];
	membersByWorkspace: Record<string, WorkspaceMember[]>;
	projectCounts: Record<string, number>;
	activeWorkspaceId: string | null;
	initialCreateOpen?: boolean;
}) {
	const [createOpen, setCreateOpen] = useState(initialCreateOpen);
	const [selected, setSelected] = useState<WorkspaceSummary | null>(null);
	const [logoPending, setLogoPending] = useState(false);
	const [logoError, setLogoError] = useState("");
	const { organization } = useOrganization();
	const router = useRouter();
	const [state, action, pending] = useActionState(
		updateWorkspaceAction,
		initialState,
	);

	useEffect(() => {
		if (initialCreateOpen) setCreateOpen(true);
	}, [initialCreateOpen]);

	const closeCreateWorkspace = () => {
		setCreateOpen(false);
		router.replace("/workspaces", { scroll: false });
	};

	const updateLogo = async (file: File | undefined) => {
		if (!file || !selected || !organization) return;
		if (!file.type.startsWith("image/"))
			return setLogoError("Choose an image file.");
		if (file.size > 10 * 1024 * 1024)
			return setLogoError("The workspace icon must be 10MB or smaller.");
		setLogoPending(true);
		setLogoError("");
		try {
			const updated = await organization.setLogo({ file });
			setSelected({ ...selected, imageUrl: updated.imageUrl });
			router.refresh();
		} catch (error) {
			setLogoError(
				error instanceof Error
					? error.message
					: "Unable to update the workspace icon.",
			);
		} finally {
			setLogoPending(false);
		}
	};

	return (
		<div className="space-y-7">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Workspaces
					</h1>
					<p className="mt-1 text-paynes_gray-500 dark:text-french_gray-400">
						One account. Multiple workspaces. Switch anytime.
					</p>
				</div>
				<Button onClick={() => setCreateOpen(true)}>
					<Plus size={16} /> Create workspace
				</Button>
			</header>
			<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
				{workspaces.map((workspace, index) => {
					const active = workspace.id === activeWorkspaceId;
					const accents = [
						"from-[#6758e8] to-[#5144dc]",
						"from-[#35c78b] to-[#14a972]",
						"from-[#ffad4d] to-[#f18727]",
						"from-[#54a5fa] to-[#3183ed]",
						"from-[#f05baa] to-[#e83391]",
					];
					return (
						<Card
							key={workspace.id}
							className="cursor-pointer overflow-hidden shadow-sm transition hover:border-blue_munsell-300 hover:shadow-md"
							onClick={() => setSelected(workspace)}
						>
							<CardContent className="flex min-h-68 flex-col p-5">
								<div className="flex items-start justify-between gap-3">
									<div className="flex min-w-0 items-start gap-4">
										{workspace.imageUrl ? (
											<span className="relative size-12 shrink-0 overflow-hidden rounded-full">
												<Image
													src={workspace.imageUrl}
													alt=""
													fill
													sizes="48px"
													className="object-cover"
												/>
											</span>
										) : (
											<span
												className={`grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-lg font-semibold text-white ${accents[index % accents.length]}`}
											>
												{workspace.name.trim().charAt(0).toUpperCase() || "W"}
											</span>
										)}
										<div className="min-w-0">
											<h2 className="truncate text-lg font-semibold text-outer_space-900 dark:text-platinum-50">
												{workspace.name}
											</h2>
											<p className="mt-1 line-clamp-2 text-sm leading-5 text-paynes_gray-500">
												A shared space for your team’s projects and
												collaboration.
											</p>
										</div>
									</div>
									{active ? (
										<span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
											Current
										</span>
									) : null}
								</div>
								<div className="mt-5">
									<AvatarStack
										users={(membersByWorkspace[workspace.id] ?? []).slice(0, 4)}
										total={workspace.memberCount}
									/>
								</div>
								<div className="mt-4 grid grid-cols-2 divide-x divide-french_gray-200 border-y border-french_gray-200 py-3 text-center dark:divide-paynes_gray-700 dark:border-paynes_gray-700">
									<div>
										<p className="text-xs text-paynes_gray-500">
											Active projects
										</p>
										<p className="mt-0.5 font-semibold text-outer_space-900 dark:text-platinum-50">
											{projectCounts[workspace.id] ?? 0}
										</p>
									</div>
									<div>
										<p className="text-xs text-paynes_gray-500">Members</p>
										<p className="mt-0.5 font-semibold text-outer_space-900 dark:text-platinum-50">
											{workspace.memberCount}
										</p>
									</div>
								</div>
								<div className="mt-auto flex items-center justify-between pt-3">
									<WorkspaceActivateButton
										workspaceId={workspace.id}
										active={active}
									/>
									<button
										type="button"
										aria-label={`View ${workspace.name} details`}
										onClick={(event) => {
											event.stopPropagation();
											setSelected(workspace);
										}}
										className="grid size-8 place-items-center rounded-lg text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300"
									>
										<MoreHorizontal size={17} />
									</button>
								</div>
							</CardContent>
						</Card>
					);
				})}
				<button
					type="button"
					onClick={() => setCreateOpen(true)}
					className="flex min-h-68 flex-col items-center justify-center rounded-2xl border border-dashed border-french_gray-300 bg-white p-6 text-center transition hover:border-blue_munsell-400 hover:bg-blue_munsell-50/20 dark:border-paynes_gray-700 dark:bg-outer_space-500 dark:hover:border-blue_munsell-600 dark:hover:bg-blue_munsell-950/10"
				>
					<span className="grid size-12 place-items-center rounded-xl border border-french_gray-300 bg-white text-outer_space-900 shadow-sm dark:border-paynes_gray-700 dark:bg-outer_space-400 dark:text-platinum-50">
						<Plus size={20} />
					</span>
					<span className="mt-4 font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
						Create workspace
					</span>
					<span className="mt-2 max-w-40 text-sm leading-5 text-paynes_gray-500">
						Start a new workspace for your team.
					</span>
				</button>
			</div>

			<Modal
				open={createOpen}
				onClose={closeCreateWorkspace}
				title="Create a workspace"
				description="Create a separate space for a team, its projects, and its permissions."
			>
				<CreateWorkspaceForm embedded />
			</Modal>
			<Modal
				open={Boolean(selected)}
				onClose={() => {
					setSelected(null);
					setLogoError("");
				}}
				title={selected?.name ?? "Workspace"}
				description="View workspace details and manage settings available to your role."
				className="max-w-5xl"
			>
				{selected ? (
					<div
						key={selected.id}
						className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
					>
						<div className="space-y-5">
							<div className="flex items-center gap-4">
								{selected.imageUrl ? (
									<span className="relative size-16 overflow-hidden rounded-2xl">
										<Image
											src={selected.imageUrl}
											alt={`${selected.name} icon`}
											fill
											sizes="64px"
											className="object-cover"
										/>
									</span>
								) : (
									<span className="grid size-16 place-items-center rounded-2xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
										<Building2 size={26} />
									</span>
								)}
								<div>
									<p className="font-semibold text-outer_space-900 dark:text-platinum-50">
										{selected.name}
									</p>
									<p className="text-sm text-paynes_gray-500">
										{selected.slug ? `@${selected.slug}` : selected.id}
									</p>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-3">
								<div className="rounded-xl bg-platinum-100 p-3 dark:bg-outer_space-400">
									<p className="text-xs text-paynes_gray-500">Members</p>
									<p className="mt-1 flex items-center gap-2 font-semibold">
										<Users size={15} />
										{selected.memberCount}
									</p>
								</div>
								<div className="rounded-xl bg-platinum-100 p-3 dark:bg-outer_space-400">
									<p className="text-xs text-paynes_gray-500">Projects</p>
									<p className="mt-1 flex items-center gap-2 font-semibold">
										<FolderKanban size={15} />
										{projectCounts[selected.id] ?? 0}
									</p>
								</div>
								<div className="rounded-xl bg-platinum-100 p-3 dark:bg-outer_space-400">
									<p className="text-xs text-paynes_gray-500">Your role</p>
									<p className="mt-1 font-semibold capitalize">
										{selected.role}
									</p>
								</div>
							</div>
							{hasPermission(selected.role, "workspace:update") &&
							selected.id === activeWorkspaceId ? (
								<div className="space-y-5">
									<div className="space-y-2">
										<Label htmlFor={`workspace-logo-${selected.id}`}>
											Workspace icon
										</Label>
										<label
											htmlFor={`workspace-logo-${selected.id}`}
											className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-french_gray-300 p-3 text-sm font-medium text-paynes_gray-600 hover:border-blue_munsell-300 hover:text-blue_munsell-600 dark:border-paynes_gray-700 dark:text-french_gray-300"
										>
											<Upload size={16} />
											{logoPending ? "Uploading…" : "Upload new icon"}
										</label>
										<input
											id={`workspace-logo-${selected.id}`}
											type="file"
											accept="image/*"
											className="sr-only"
											disabled={logoPending}
											onChange={(event) =>
												void updateLogo(event.target.files?.[0])
											}
										/>
										{logoError ? (
											<p className="text-sm text-red-600">{logoError}</p>
										) : null}
									</div>
									<form action={action} className="space-y-3">
										<input
											type="hidden"
											name="workspaceId"
											value={selected.id}
										/>
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
								</div>
							) : null}
						</div>
						<aside className="border-t border-french_gray-200 pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 dark:border-paynes_gray-800">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-outer_space-900 dark:text-platinum-50">
									Members
								</h3>
								<span className="text-xs text-paynes_gray-500">
									{selected.memberCount} total
								</span>
							</div>
							<div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
								{(membersByWorkspace[selected.id] ?? []).map((member) => (
									<div
										key={member.id}
										className="flex items-center gap-3 rounded-xl p-2 hover:bg-platinum-100 dark:hover:bg-outer_space-400"
									>
										<Avatar
											name={member.name}
											src={member.avatarUrl}
											className="size-9"
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-medium text-outer_space-900 dark:text-platinum-50">
												{member.name}
											</p>
											<p className="truncate text-xs text-paynes_gray-500">
												{member.email}
											</p>
										</div>
										<span className="text-xs capitalize text-paynes_gray-500">
											{member.role}
										</span>
									</div>
								))}
							</div>
						</aside>
					</div>
				) : null}
			</Modal>
		</div>
	);
}
