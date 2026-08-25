"use client";

import { Pencil, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { removeProjectMemberAction } from "@/app/actions/projects";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/rbac";
import type { MemberRole, ProjectMember, UserSummary } from "@/types";

export function ProjectMembers({
	projectId,
	role,
	members,
	workspaceUsers,
	variant = "panel",
	embeddedForm = false,
}: {
	projectId: string;
	role: MemberRole;
	members: ProjectMember[];
	workspaceUsers: UserSummary[];
	variant?: "panel" | "manager";
	embeddedForm?: boolean;
}) {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [viewAllOpen, setViewAllOpen] = useState(false);
	const [editingRoles, setEditingRoles] = useState<Set<string>>(new Set());
	const [memberToRemove, setMemberToRemove] = useState<ProjectMember | null>(
		null,
	);
	const [removeError, setRemoveError] = useState("");
	const [isPending, startTransition] = useTransition();
	const canManage = hasPermission(role, "project:manage-members");
	const memberIds = new Set(members.map((member) => member.user.id));
	const availableUsers = workspaceUsers.filter(
		(user) => !memberIds.has(user.id),
	);

	const removeMember = () => {
		if (!memberToRemove) return;
		startTransition(async () => {
			const result = await removeProjectMemberAction(
				projectId,
				memberToRemove.user.id,
			);
			setMessage(result.message);
			if (result.success) {
				setMemberToRemove(null);
				setRemoveError("");
				router.refresh();
			} else {
				setRemoveError(result.message);
			}
		});
	};

	const memberRow = (member: ProjectMember, editable = false) => {
		const roleLabel =
			member.roleLabel ?? (member.role === "owner" ? "Owner" : "Contributor");
		const accessRole =
			member.role === "viewer"
				? "Viewer"
				: member.role.charAt(0).toUpperCase() + member.role.slice(1);
		const isEditingRole = editingRoles.has(member.user.id);

		return (
			<div
				key={member.user.id}
				className="flex items-center gap-3 rounded-xl py-2"
			>
				<Avatar
					name={member.user.name}
					src={member.user.avatarUrl}
					className="size-9"
				/>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium text-outer_space-900 dark:text-platinum-50">
						{member.user.name}
					</p>
					<p className="truncate text-xs text-paynes_gray-500">{accessRole}</p>
				</div>
				{editable && canManage && embeddedForm ? (
					isEditingRole ? (
						<Input
							name={`memberRoleLabel:${member.user.id}`}
							defaultValue={roleLabel}
							placeholder="Enter project role"
							maxLength={40}
							required
							className="w-48"
						/>
					) : (
						<>
							<input
								type="hidden"
								name={`memberRoleLabel:${member.user.id}`}
								value={roleLabel}
							/>
							<button
								type="button"
								onClick={() =>
									setEditingRoles((current) =>
										new Set(current).add(member.user.id),
									)
								}
								className="flex max-w-48 items-center gap-2 rounded-lg px-2 py-1 text-sm text-paynes_gray-600 hover:bg-platinum-100 hover:text-blue_munsell-600 dark:text-french_gray-300 dark:hover:bg-outer_space-300"
								aria-label={`Edit ${member.user.name}'s project role`}
							>
								<span className="truncate">{roleLabel}</span>
								<Pencil size={13} className="shrink-0" />
							</button>
						</>
					)
				) : (
					<Badge>{roleLabel}</Badge>
				)}
				{editable && canManage && member.role !== "owner" ? (
					<Button
						type="button"
						size="icon"
						variant="ghost"
						className="size-8"
						disabled={isPending}
						onClick={() => {
							setRemoveError("");
							setMemberToRemove(member);
						}}
						aria-label={`Remove ${member.user.name}`}
					>
						<X size={14} />
					</Button>
				) : null}
			</div>
		);
	};

	const removeConfirmation = (
		<ConfirmationModal
			open={memberToRemove !== null}
			onClose={() => {
				if (!isPending) setMemberToRemove(null);
			}}
			onConfirm={removeMember}
			title="Remove project member?"
			confirmLabel="Remove member"
			pending={isPending}
			error={removeError}
		>
			<p>
				Remove <strong>{memberToRemove?.user.name}</strong> from this project?
				They will lose access granted through this project.
			</p>
		</ConfirmationModal>
	);

	if (variant === "manager") {
		return (
			<>
				<div className="space-y-4">
					<div className="max-h-72 divide-y divide-french_gray-200 overflow-y-auto pr-1 scrollbar-thin dark:divide-paynes_gray-800">
						{members.map((member) => memberRow(member, true))}
					</div>
					{canManage && availableUsers.length && embeddedForm ? (
						<div className="grid gap-2 border-t border-french_gray-200 pt-4 sm:grid-cols-2 dark:border-paynes_gray-800">
							<Select
								name="newMemberId"
								defaultValue=""
								options={[
									{
										value: "",
										label: "Add a workspace member",
										disabled: true,
									},
									...availableUsers.map((user) => ({
										value: user.id,
										label: user.name,
									})),
								]}
							/>
							<Input
								name="newMemberRoleLabel"
								defaultValue="Contributor"
								placeholder="Enter project role"
								maxLength={40}
							/>
						</div>
					) : null}
					{message ? (
						<p className="text-xs text-paynes_gray-500">{message}</p>
					) : null}
				</div>
				{removeConfirmation}
			</>
		);
	}

	return (
		<>
			<section className="min-h-[20rem] rounded-2xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-800 dark:bg-outer_space-500">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
						Project Members
					</h2>
					<button
						type="button"
						onClick={() => setViewAllOpen(true)}
						className="text-xs font-semibold text-blue_munsell-600 dark:text-blue_munsell-300"
					>
						View all
					</button>
				</div>
				<div className="mt-4 divide-y divide-french_gray-200 dark:divide-paynes_gray-800">
					{members.length ? (
						members.slice(0, 5).map((member) => memberRow(member))
					) : (
						<p className="py-12 text-center text-sm text-paynes_gray-500">
							No project members yet.
						</p>
					)}
				</div>
			</section>
			<Modal
				open={viewAllOpen}
				onClose={() => setViewAllOpen(false)}
				title="Project members"
				description={`${members.length} member${members.length === 1 ? "" : "s"} assigned to this project.`}
				className="max-w-2xl"
			>
				<div className="max-h-[60vh] divide-y divide-french_gray-200 overflow-y-auto pr-2 scrollbar-thin dark:divide-paynes_gray-800">
					{members.map((member) => memberRow(member))}
				</div>
			</Modal>
			{removeConfirmation}
		</>
	);
}
