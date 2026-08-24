"use client";

import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
	addProjectMemberAction,
	removeProjectMemberAction,
} from "@/app/actions/projects";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/rbac";
import type { MemberRole, ProjectMember, UserSummary } from "@/types";

export function ProjectMembers({
	projectId,
	role,
	members,
	workspaceUsers,
}: {
	projectId: string;
	role: MemberRole;
	members: ProjectMember[];
	workspaceUsers: UserSummary[];
}) {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [isPending, startTransition] = useTransition();
	const canManage = hasPermission(role, "project:manage-members");
	const memberIds = new Set(members.map((member) => member.user.id));
	const availableUsers = workspaceUsers.filter(
		(user) => !memberIds.has(user.id),
	);

	const addMember = (formData: FormData) => {
		startTransition(async () => {
			const result = await addProjectMemberAction(formData);
			setMessage(result.message);
			if (result.success) router.refresh();
		});
	};
	const removeMember = (userId: string) => {
		startTransition(async () => {
			const result = await removeProjectMemberAction(projectId, userId);
			setMessage(result.message);
			if (result.success) router.refresh();
		});
	};

	return (
		<section className="rounded-xl border border-french_gray-300 bg-white p-4 dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<h2 className="font-semibold text-outer_space-500 dark:text-platinum-500">
				Project members
			</h2>
			<div className="mt-3 space-y-3">
				{members.map((member) => (
					<div key={member.user.id} className="flex items-center gap-2">
						<Avatar name={member.user.name} src={member.user.avatarUrl} />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-outer_space-500 dark:text-platinum-500">
								{member.user.name}
							</p>
							<p className="truncate text-xs text-paynes_gray-500">
								{member.user.email}
							</p>
						</div>
						<Badge className="capitalize">{member.role}</Badge>
						{canManage && member.role !== "owner" ? (
							<Button
								size="icon"
								variant="ghost"
								className="size-8"
								disabled={isPending}
								onClick={() => removeMember(member.user.id)}
								aria-label={`Remove ${member.user.name}`}
							>
								<X size={14} />
							</Button>
						) : null}
					</div>
				))}
			</div>
			{canManage && availableUsers.length > 0 ? (
				<form
					action={addMember}
					className="mt-4 space-y-2 border-t border-french_gray-300 pt-4 dark:border-paynes_gray-400"
				>
					<input type="hidden" name="projectId" value={projectId} />
					<Select
						name="userId"
						required
						defaultValue=""
						options={[{ value: "", label: "Select a user", disabled: true }, ...availableUsers.map((user) => ({ value: user.id, label: user.name }))]}
					/>
					<div className="flex gap-2">
						<Select
							name="role"
							defaultValue="member"
							className="min-w-0 flex-1"
							options={[{ value: "admin", label: "Admin" }, { value: "member", label: "Member" }, { value: "viewer", label: "Viewer" }]}
						/>
						<Button type="submit" size="sm" disabled={isPending}>
							<UserPlus size={14} /> Add
						</Button>
					</div>
				</form>
			) : null}
			{message ? (
				<p className="mt-3 text-xs text-paynes_gray-500">{message}</p>
			) : null}
		</section>
	);
}
