"use client";

import {
	CalendarDays,
	CheckCircle2,
	Lock,
	MoreHorizontal,
	Trash2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteProjectAction } from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { formatDate } from "@/lib/utils";
import type { ProjectSummary } from "@/types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [deleteModalOpen, setDeleteModalOpen] = useState(false);
	const [deleteError, setDeleteError] = useState("");
	const [isPending, startTransition] = useTransition();
	const progress =
		project.taskCount === 0
			? 0
			: Math.round((project.completedTaskCount / project.taskCount) * 100);
	const canDelete = project.isOwner || project.role === "admin";

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
			<Card className="group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
				<CardHeader className="pb-3">
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<div className="mb-2 flex flex-wrap gap-2">
								<Badge className="capitalize">{project.role}</Badge>
								{project.visibility === "private" ? (
									<Badge>
										<Lock size={11} /> Private
									</Badge>
								) : (
									<Badge>Workspace</Badge>
								)}
							</div>
							<Link
								href={`/projects/${project.id}`}
								className="block truncate text-lg font-semibold text-outer_space-500 hover:text-blue_munsell-500 dark:text-platinum-500"
							>
								{project.name}
							</Link>
						</div>
						<div className="relative">
							<Button
								variant="ghost"
								size="icon"
								aria-label="Project actions"
								onClick={() => setMenuOpen((open) => !open)}
							>
								<MoreHorizontal size={18} />
							</Button>
							{menuOpen ? (
								<div className="absolute right-0 top-10 z-10 min-w-40 rounded-lg border border-french_gray-300 bg-white p-1 shadow-lg dark:border-paynes_gray-400 dark:bg-outer_space-400">
									<Link
										href={`/projects/${project.id}`}
										className="block rounded-md px-3 py-2 text-sm hover:bg-platinum-700 dark:hover:bg-paynes_gray-400"
									>
										Open project
									</Link>
									{canDelete ? (
										<button
											type="button"
											disabled={isPending}
											onClick={openDeleteModal}
											className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
										>
											<Trash2 size={14} /> {isPending ? "Deleting…" : "Delete"}
										</button>
									) : null}
								</div>
							) : null}
						</div>
					</div>
					<p className="line-clamp-2 min-h-10 text-sm text-paynes_gray-500 dark:text-french_gray-400">
						{project.description || "No description yet."}
					</p>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-3 gap-2 text-xs text-paynes_gray-500 dark:text-french_gray-400">
						<span className="flex items-center gap-1">
							<Users size={14} /> {project.memberCount}
						</span>
						<span className="flex items-center gap-1">
							<CheckCircle2 size={14} /> {project.completedTaskCount}/
							{project.taskCount}
						</span>
						<span className="flex items-center justify-end gap-1">
							<CalendarDays size={14} />{" "}
							{project.dueDate
								? formatDate(project.dueDate, { year: undefined })
								: "Open"}
						</span>
					</div>
					<div>
						<div className="mb-1 flex justify-between text-xs text-paynes_gray-500 dark:text-french_gray-400">
							<span>Progress</span>
							<span>{progress}%</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-platinum-700 dark:bg-outer_space-300">
							<div
								className="h-full rounded-full bg-blue_munsell-500 transition-all"
								style={{ width: `${progress}%` }}
							/>
						</div>
					</div>
				</CardContent>
			</Card>
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
