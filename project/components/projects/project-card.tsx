"use client";

import {
	CalendarDays,
	CheckCircle2,
	FolderKanban,
	Pencil,
	MoreHorizontal,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteProjectAction } from "@/app/actions/projects";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { hasPermission } from "@/lib/rbac";
import { formatDate } from "@/lib/utils";
import type { ProjectSummary } from "@/types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [editModalOpen, setEditModalOpen] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	const [isPending, startTransition] = useTransition();
	const menuRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!menuOpen) return;
		const close = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [menuOpen]);
	const progress =
		project.taskCount === 0
			? 0
			: Math.round((project.completedTaskCount / project.taskCount) * 100);
	const canManage =
		project.isOwner || hasPermission(project.role, "project:delete");

	const openDeleteModal = () => {
		setMenuOpen(false);
		setDeleteError("");
		setDeleteModalOpen(true);
	};

	const closeDeleteModal = () => {
		if (!isPending) setDeleteModalOpen(false);
	};

	const deleteProject = () => {
		startTransition(async () => {
			const result = await deleteProjectAction(project.id);
			if (result.success) {
				setDeleteModalOpen(false);
				return;
			}
			setDeleteError(result.message);
		});
	};

	return (
		<>
			<Card className="group relative min-h-72 overflow-hidden shadow-sm transition hover:border-blue_munsell-300 hover:shadow-lg">
				<Link
					href={`/projects/${project.id}`}
					aria-label={`Open ${project.name}`}
					className="absolute inset-0 z-0 rounded-[inherit] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue_munsell-400"
				/>
				<CardContent className="relative z-0 flex h-full flex-col p-5 pointer-events-none">
					<div className="flex items-start justify-between gap-3">
						<div className="flex min-w-0 items-start gap-3">
							{project.iconDataUrl ? (
								<span className="relative size-12 shrink-0 overflow-hidden rounded-xl">
									<Image
										src={project.iconDataUrl}
										alt=""
										fill
										sizes="48px"
										className="object-cover"
									/>
								</span>
							) : (
								<span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue_munsell-500 to-violet-600 text-white shadow-sm">
									<FolderKanban size={22} />
								</span>
							)}
							<div className="min-w-0">
								<h2 className="truncate text-lg font-semibold text-outer_space-900 transition group-hover:text-blue_munsell-500 dark:text-platinum-50">
									{project.name}
								</h2>
								<p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-paynes_gray-500 dark:text-french_gray-400">
									{project.description || "No description yet."}
								</p>
							</div>
						</div>
						{canManage ? (
							<div ref={menuRef} className="pointer-events-auto relative z-10">
								<Button
									variant="ghost"
									size="icon"
									aria-label="Project actions"
									onClick={() => setMenuOpen((open) => !open)}
								>
									<MoreHorizontal size={18} />
								</Button>
								{menuOpen ? (
									<div className="absolute right-0 top-10 z-10 min-w-40 animate-in fade-in slide-in-from-top-1 rounded-xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-700 dark:bg-outer_space-400">
										<button
											type="button"
											onClick={() => {
												setMenuOpen(false);
												setEditModalOpen(true);
											}}
											className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-platinum-700 dark:hover:bg-paynes_gray-400"
										>
											<Pencil size={14} /> Edit Project Details
										</button>
										{canManage ? (
											<button
												type="button"
												disabled={isPending}
												onClick={openDeleteModal}
												className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
											>
												<Trash2 size={14} />{" "}
												{isPending ? "Deleting…" : "Delete Project"}
											</button>
										) : null}
									</div>
								) : null}
							</div>
						) : null}
					</div>
					<div className="mt-5">
						<div className="mb-2 flex items-center justify-between text-xs text-paynes_gray-500">
							<span>Progress</span>
							<strong className="text-outer_space-900 dark:text-platinum-50">
								{progress}%
							</strong>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-platinum-200 dark:bg-outer_space-300">
							<div
								className="h-full rounded-full bg-blue_munsell-500"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
					<div className="mt-5 grid grid-cols-3 divide-x divide-french_gray-200 border-y border-french_gray-200 py-3 text-xs text-paynes_gray-500 dark:divide-paynes_gray-700 dark:border-paynes_gray-700">
						<span className="flex items-center justify-center gap-1.5">
							<FolderKanban size={14} /> {project.taskCount} tasks
						</span>
						<span className="flex items-center justify-center gap-1.5">
							<CheckCircle2 size={14} className="text-emerald-500" />{" "}
							{project.completedTaskCount} done
						</span>
						<span className="flex items-center justify-center gap-1.5">
							<CalendarDays size={14} />{" "}
							{project.dueDate
								? formatDate(project.dueDate, { year: undefined })
								: "No date"}
						</span>
					</div>
					<div className="mt-auto flex items-end justify-between gap-3 pt-4">
						<AvatarStack users={project.members} total={project.memberCount} />
						<div className="flex flex-wrap justify-end gap-1.5">
							<Badge className="capitalize">{project.role}</Badge>
							<Badge>
								{project.visibility === "private" ? "Private" : "Workspace"}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
			<EditProjectModal
				project={project}
				open={editModalOpen}
				onClose={() => setEditModalOpen(false)}
			/>
			<ConfirmationModal
				open={deleteModalOpen}
				onClose={closeDeleteModal}
				onConfirm={deleteProject}
				title="Delete project?"
				confirmLabel="Delete project"
				pending={isPending}
				error={deleteError}
			>
				<p>
					Deleting <strong>{project.name}</strong> will permanently remove the
					project and all of its tasks.
				</p>
			</ConfirmationModal>
		</>
	);
}
