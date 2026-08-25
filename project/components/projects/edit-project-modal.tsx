"use client";

import Image from "next/image";
import { useActionState } from "react";
import { updateProjectAction } from "@/app/actions/projects";
import { ProjectMembers } from "@/components/project-detail/project-members";
import { Button } from "@/components/ui/button";
import { DeadlineInput } from "@/components/ui/deadline-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type {
	ActionResult,
	MemberRole,
	ProjectMember,
	ProjectSummary,
	UserSummary,
} from "@/types";

const initialState: ActionResult = { success: false, message: "" };

export function EditProjectModal({
	project,
	members = [],
	workspaceUsers = [],
	role = "viewer",
	open,
	onClose,
}: {
	project:
		| ProjectSummary
		| Pick<
				ProjectSummary,
				"id" | "name" | "description" | "dueDate" | "iconDataUrl"
		  >;
	members?: ProjectMember[];
	workspaceUsers?: UserSummary[];
	role?: MemberRole;
	open: boolean;
	onClose: () => void;
}) {
	const [state, action, pending] = useActionState(
		async (_previous: ActionResult, formData: FormData) =>
			updateProjectAction(formData),
		initialState,
	);

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Edit project details"
			description="Update project identity, deadline, and project-local member roles."
			className="max-w-3xl"
		>
			<form action={action} className="space-y-4">
				<input type="hidden" name="projectId" value={project.id} />
				<div className="grid gap-4 sm:grid-cols-[5rem_1fr] sm:items-end">
					<div className="relative grid size-20 place-items-center overflow-hidden rounded-2xl bg-blue_munsell-500 text-2xl font-bold text-white">
						{project.iconDataUrl ? (
							<Image
								src={project.iconDataUrl}
								alt="Current project icon"
								fill
								sizes="80px"
								unoptimized
								className="object-cover"
							/>
						) : (
							project.name.slice(0, 1).toUpperCase()
						)}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor={`project-icon-${project.id}`}>Project icon</Label>
						<Input
							id={`project-icon-${project.id}`}
							name="icon"
							type="file"
							accept="image/*"
						/>
						<p className="text-xs text-paynes_gray-500">
							PNG, JPG, WebP, or SVG up to 512KB.
						</p>
					</div>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`project-name-${project.id}`}>Name</Label>
					<Input
						id={`project-name-${project.id}`}
						name="name"
						defaultValue={project.name}
						required
						minLength={2}
						maxLength={100}
						autoFocus
					/>
					{state.fieldErrors?.name?.[0] ? (
						<p className="text-xs text-red-600">{state.fieldErrors.name[0]}</p>
					) : null}
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`project-description-${project.id}`}>
						Description
					</Label>
					<Textarea
						id={`project-description-${project.id}`}
						name="description"
						defaultValue={project.description ?? ""}
						maxLength={800}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`project-due-date-${project.id}`}>Due date</Label>
					<DeadlineInput
						id={`project-due-date-${project.id}`}
						name="dueDate"
						defaultValue={project.dueDate?.slice(0, 10) ?? ""}
					/>
				</div>
				{members.length ? (
					<div className="mt-6 border-t border-french_gray-200 pt-5 dark:border-paynes_gray-800">
						<h3 className="mb-1 font-semibold text-outer_space-900 dark:text-platinum-50">
							Project members and role labels
						</h3>
						<p className="mb-3 text-xs text-paynes_gray-500 dark:text-french_gray-400">
							Click a role to edit it. All changes are saved together.
						</p>
						<ProjectMembers
							projectId={project.id}
							role={role}
							members={members}
							workspaceUsers={workspaceUsers}
							variant="manager"
							embeddedForm
						/>
					</div>
				) : null}
				<div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-t border-french_gray-200 pt-4 dark:border-paynes_gray-800">
					<div className="min-w-0 flex-1">
						{state.message ? (
							<p
								role="status"
								className={
									state.success
										? "text-sm text-emerald-600"
										: "text-sm text-red-600 dark:text-red-300"
								}
							>
								{state.message}
							</p>
						) : null}
					</div>
					<div className="flex shrink-0 gap-2">
						<Button
							type="button"
							variant="secondary"
							onClick={onClose}
							disabled={pending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending}>
							{pending ? "Saving…" : "Save changes"}
						</Button>
					</div>
				</div>
			</form>
		</Modal>
	);
}
