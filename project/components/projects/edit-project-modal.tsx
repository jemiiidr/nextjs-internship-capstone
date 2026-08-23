"use client";

import { useActionState, useEffect } from "react";
import { updateProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult, ProjectSummary } from "@/types";

const initialState: ActionResult = { success: false, message: "" };

export function EditProjectModal({
	project,
	open,
	onClose,
}: {
	project: ProjectSummary;
	open: boolean;
	onClose: () => void;
}) {
	const [state, action, pending] = useActionState(
		async (_previous: ActionResult, formData: FormData) =>
			updateProjectAction(formData),
		initialState,
	);

	useEffect(() => {
		if (state.success) onClose();
	}, [onClose, state.success]);

	return (
		<Modal
			open={open}
			onClose={onClose}
			title="Edit project details"
			description="Update the project name, description, and target date."
		>
			<form action={action} className="space-y-4">
				<input type="hidden" name="projectId" value={project.id} />
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
					<Label htmlFor={`project-description-${project.id}`}>Description</Label>
					<Textarea
						id={`project-description-${project.id}`}
						name="description"
						defaultValue={project.description ?? ""}
						maxLength={800}
					/>
				</div>
				<div className="space-y-1.5">
					<Label htmlFor={`project-due-date-${project.id}`}>Due date</Label>
					<Input
						id={`project-due-date-${project.id}`}
						name="dueDate"
						type="date"
						defaultValue={project.dueDate?.slice(0, 10) ?? ""}
					/>
				</div>
				{state.message && !state.success ? (
					<p role="alert" className="text-sm text-red-600 dark:text-red-300">
						{state.message}
					</p>
				) : null}
				<div className="flex justify-end gap-2 pt-2">
					<Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
						Cancel
					</Button>
					<Button type="submit" disabled={pending}>
						{pending ? "Saving…" : "Save changes"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
