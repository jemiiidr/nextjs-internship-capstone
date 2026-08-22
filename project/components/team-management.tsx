"use client";

import { MailPlus, ShieldCheck, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
	inviteWorkspaceMemberAction,
	revokeWorkspaceInvitationAction,
} from "@/app/actions/team";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import type {
	ActionResult,
	WorkspaceInvitation,
	WorkspaceMember,
} from "@/types";

const initialState: ActionResult = { success: false, message: "" };

export function InviteMemberButton() {
	const [open, setOpen] = useState(false);
	const [state, formAction, pending] = useActionState(
		inviteWorkspaceMemberAction,
		initialState,
	);

	useEffect(() => {
		if (state.success) setOpen(false);
	}, [state.success]);

	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<MailPlus size={16} /> Invite member
			</Button>
			<Modal
				open={open}
				onClose={() => {
					if (!pending) setOpen(false);
				}}
				title="Invite team member"
				description="Clerk will email an invitation that expires in 7 days."
				className="max-w-md"
			>
				<form action={formAction} className="space-y-5">
					<div className="space-y-1.5">
						<Label htmlFor="invite-email">Email address</Label>
						<Input
							id="invite-email"
							name="email"
							type="email"
							autoComplete="email"
							required
							maxLength={254}
							placeholder="teammate@example.com"
							autoFocus
						/>
						{state.fieldErrors?.email?.[0] ? (
							<p className="text-xs text-red-600">
								{state.fieldErrors.email[0]}
							</p>
						) : null}
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="invite-role">Workspace role</Label>
						<select
							id="invite-role"
							name="role"
							defaultValue="org:member"
							className="h-10 w-full rounded-lg border border-french_gray-300 bg-white px-3 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"
						>
							<option value="org:member">Member</option>
							<option value="org:admin">Admin</option>
						</select>
						<p className="text-xs text-paynes_gray-500">
							Admins can manage members and workspace projects.
						</p>
					</div>
					{state.message && !state.success ? (
						<p role="alert" className="text-sm text-red-600 dark:text-red-400">
							{state.message}
						</p>
					) : null}
					<div className="flex justify-end gap-2">
						<Button
							variant="secondary"
							onClick={() => setOpen(false)}
							disabled={pending}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={pending}>
							{pending ? "Sending…" : "Send invitation"}
						</Button>
					</div>
				</form>
			</Modal>
		</>
	);
}

function PendingInvitations({
	invitations,
}: {
	invitations: WorkspaceInvitation[];
}) {
	const router = useRouter();
	const [selected, setSelected] = useState<WorkspaceInvitation | null>(null);
	const [error, setError] = useState("");
	const [pending, startTransition] = useTransition();

	const revoke = () => {
		if (!selected) return;
		startTransition(async () => {
			const result = await revokeWorkspaceInvitationAction(selected.id);
			if (result.success) {
				setSelected(null);
				router.refresh();
			} else setError(result.message);
		});
	};

	if (invitations.length === 0) return null;
	return (
		<>
			<div className="overflow-hidden rounded-2xl border border-french_gray-300 dark:border-paynes_gray-800">
				{invitations.map((invitation) => (
					<div
						key={invitation.id}
						className="flex flex-col gap-3 border-b border-french_gray-200 p-4 last:border-b-0 sm:flex-row sm:items-center dark:border-paynes_gray-800"
					>
						<div className="min-w-0 flex-1">
							<p className="truncate font-medium">{invitation.email}</p>
							<p className="text-xs text-paynes_gray-500">
								Expires {formatDate(invitation.expiresAt)}
							</p>
						</div>
						<Badge className="capitalize">{invitation.role}</Badge>
						<Button
							variant="ghost"
							size="sm"
							className="text-red-600"
							onClick={() => {
								setError("");
								setSelected(invitation);
							}}
						>
							<Trash2 size={14} /> Revoke
						</Button>
					</div>
				))}
			</div>
			<ConfirmationModal
				open={selected !== null}
				onClose={() => {
					if (!pending) setSelected(null);
				}}
				onConfirm={revoke}
				title="Revoke invitation?"
				confirmLabel="Revoke invitation"
				pending={pending}
				error={error}
			>
				<p>
					<strong>{selected?.email}</strong> will no longer be able to use this
					invitation to join the workspace.
				</p>
			</ConfirmationModal>
		</>
	);
}

export function TeamTabs({
	members,
	invitations,
}: {
	members: WorkspaceMember[];
	invitations: WorkspaceInvitation[];
}) {
	const [activeTab, setActiveTab] = useState<"members" | "invitations">(
		"members",
	);

	return (
		<section className="space-y-5">
			<div
				role="tablist"
				aria-label="Team directory"
				className="flex gap-1 border-b border-french_gray-300 dark:border-paynes_gray-800"
			>
				<button
					type="button"
					role="tab"
					aria-selected={activeTab === "members"}
					onClick={() => setActiveTab("members")}
					className={`relative px-4 py-3 text-sm font-semibold transition ${
						activeTab === "members"
							? "text-blue_munsell-600 dark:text-blue_munsell-300"
							: "text-paynes_gray-500 hover:text-outer_space-900 dark:hover:text-platinum-50"
					}`}
				>
					Members
					{activeTab === "members" ? (
						<span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue_munsell-500" />
					) : null}
				</button>
				<button
					type="button"
					role="tab"
					aria-selected={activeTab === "invitations"}
					onClick={() => setActiveTab("invitations")}
					className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition ${
						activeTab === "invitations"
							? "text-blue_munsell-600 dark:text-blue_munsell-300"
							: "text-paynes_gray-500 hover:text-outer_space-900 dark:hover:text-platinum-50"
					}`}
				>
					Pending Invites
					{invitations.length > 0 ? (
						<span className="inline-flex items-center justify-center rounded-full bg-blue_munsell-100 px-1.5 py-0.5 text-[11px] font-bold text-blue_munsell-700 dark:bg-blue_munsell-900/50 dark:text-blue_munsell-200">
							({invitations.length})
						</span>
					) : null}
					{activeTab === "invitations" ? (
						<span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-blue_munsell-500" />
					) : null}
				</button>
			</div>

			{activeTab === "members" ? (
				members.length > 0 ? (
					<div
						role="tabpanel"
						className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
					>
						{members.map((member) => (
							<Card key={member.id}>
								<CardContent className="flex items-center gap-3 p-5">
									<Avatar
										name={member.name}
										src={member.avatarUrl}
										className="size-11"
									/>
									<div className="min-w-0 flex-1">
										<p className="truncate font-semibold text-outer_space-900 dark:text-platinum-50">
											{member.name}
										</p>
										<p className="truncate text-sm text-paynes_gray-500">
											{member.email}
										</p>
									</div>
									<Badge className="capitalize">
										<ShieldCheck size={12} /> {member.role}
									</Badge>
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div
						role="tabpanel"
						className="rounded-2xl border border-dashed border-french_gray-300 p-10 text-center"
					>
						<Users className="mx-auto text-paynes_gray-400" />
						<p className="mt-3 text-sm text-paynes_gray-500">
							No workspace members returned by Clerk.
						</p>
					</div>
				)
			) : invitations.length > 0 ? (
				<div role="tabpanel">
					<PendingInvitations invitations={invitations} />
				</div>
			) : (
				<div
					role="tabpanel"
					className="rounded-2xl border border-dashed border-french_gray-300 p-10 text-center"
				>
					<MailPlus className="mx-auto text-paynes_gray-400" />
					<p className="mt-3 text-sm text-paynes_gray-500">
						There are no pending invitations.
					</p>
				</div>
			)}
		</section>
	);
}
