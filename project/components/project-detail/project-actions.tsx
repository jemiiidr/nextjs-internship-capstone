"use client";

import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { Button } from "@/components/ui/button";
import type {
	MemberRole,
	ProjectMember,
	ProjectSummary,
	UserSummary,
} from "@/types";

export function ProjectActions({
	project,
	members,
	workspaceUsers,
	role,
}: {
	project: Pick<
		ProjectSummary,
		"id" | "name" | "description" | "dueDate" | "iconDataUrl"
	>;
	members: ProjectMember[];
	workspaceUsers: UserSummary[];
	role: MemberRole;
}) {
	const [editOpen, setEditOpen] = useState(false);

	return (
		<>
			<Button
				variant="secondary"
				size="icon"
				onClick={() => setEditOpen(true)}
				aria-label="Edit project details"
				title="Edit project details"
			>
				<MoreHorizontal size={18} />
			</Button>
			<EditProjectModal
				project={project}
				members={members}
				workspaceUsers={workspaceUsers}
				role={role}
				open={editOpen}
				onClose={() => setEditOpen(false)}
			/>
		</>
	);
}
