"use client";

import { useActionState, useEffect } from "react";
import { createProjectAction } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { DeadlineInput } from "@/components/ui/deadline-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUIStore } from "@/stores/ui-store";
import type { ActionResult, ProjectSummary } from "@/types";

const initialState: ActionResult<ProjectSummary> = {
	success: false,
	message: "",
};

export function CreateProjectModal() {
	const open = useUIStore((state) => state.isCreateProjectOpen);
	const close = useUIStore((state) => state.closeCreateProject);
	const [state, formAction, pending] = useActionState(
		async (_previous: ActionResult<ProjectSummary>, formData: FormData) =>
			createProjectAction(formData),
		initialState,
	);

	useEffect(() => {
		if (state.success) close();
	}, [close, state.success]);

	return (
		<Modal
			open={open}
			onClose={close}
			title="Create project"
			description="A starter board with To do, In progress, and Done lists is created automatically."
		>
			<form action={formAction} className="space-y-4">
				<div className="space-y-1.5">
					<Label htmlFor="project-name">Name</Label>
					<Input
						id="project-name"
						name="name"
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
					<Label htmlFor="project-description">Description</Label>
					<Textarea
						id="project-description"
						name="description"
						maxLength={800}
						placeholder="What is this project for?"
					/>
				</div>
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-1.5">
						<Label htmlFor="project-due-date">Due date</Label>
						<DeadlineInput id="project-due-date" name="dueDate" />
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="project-visibility">Visibility</Label>
						<Select
							id="project-visibility"
							name="visibility"
							defaultValue="private"
							options={[
								{ value: "private", label: "Private" },
								{ value: "workspace", label: "Workspace" },
							]}
						/>
					</div>
				</div>
				{state.message && !state.success ? (
					<p role="alert" className="text-sm text-red-600">
						{state.message}
					</p>
				) : null}
				<div className="flex justify-end gap-2 pt-2">
					<Button variant="secondary" onClick={close}>
						Cancel
					</Button>
					<Button type="submit" disabled={pending}>
						{pending ? "Creating…" : "Create project"}
					</Button>
				</div>
			</form>
		</Modal>
	);
}
