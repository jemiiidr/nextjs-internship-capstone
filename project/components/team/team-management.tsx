"use client";

import { useOrganizationList } from "@clerk/nextjs";
import { Building2, MailPlus, ShieldCheck, Trash2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState, useTransition } from "react";
import {
	inviteWorkspaceMemberAction,
	notifyWorkspaceJoinedAction,
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
import { Select } from "@/components/ui/select";
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
						<Select
							id="invite-role"
							name="role"
							defaultValue="org:member"
							options={[{ value: "org:member", label: "Member" }, { value: "org:admin", label: "Admin" }]}
						/>
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
	const router = useRouter();
	const [acceptError, setAcceptError] = useState("");
	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [isAccepting, startAccepting] = useTransition();
	const { isLoaded, setActive, userInvitations } = useOrganizationList({
		userInvitations: { status: "pending", infinite: true, pageSize: 20 },
	});
	const incomingInvitations = userInvitations.data ?? [];
	const pendingCount = invitations.length + incomingInvitations.length;

	const acceptInvitation = (
		invitation: (typeof incomingInvitations)[number],
	) => {
		if (!setActive) return;
		setAcceptError("");
		setAcceptingId(invitation.id);
		startAccepting(async () => {
			try {
				await invitation.accept();
				await userInvitations.revalidate();
				await setActive({
					organization: invitation.publicOrganizationData.id,
				});
				await notifyWorkspaceJoinedAction(invitation.publicOrganizationData.id);
				router.push("/team");
				router.refresh();
			} catch (error) {
				console.error("Unable to accept Clerk organization invitation", error);
				setAcceptError(
					"Clerk could not accept this invitation. Please try again.",
				);
			} finally {
				setAcceptingId(null);
			}
		});
	};

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
					{pendingCount > 0 ? (
						<span className="inline-flex items-center justify-center rounded-full bg-blue_munsell-100 px-1.5 py-0.5 text-[11px] font-bold text-blue_munsell-700 dark:bg-blue_munsell-900/50 dark:text-blue_munsell-200">
							({pendingCount})
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
			) : pendingCount > 0 || !isLoaded ? (
				<div role="tabpanel" className="space-y-6">
					{!isLoaded ? (
						<div className="rounded-2xl border border-french_gray-300 bg-white p-5 text-sm text-paynes_gray-500 dark:border-paynes_gray-800 dark:bg-outer_space-500">
							Loading invitations…
						</div>
					) : null}
					{incomingInvitations.length > 0 ? (
						<section className="space-y-3">
							<div>
								<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
									Invitations for you
								</h2>
								<p className="text-sm text-paynes_gray-500">
									Accept an invitation to join and open its workspace.
								</p>
							</div>
							{acceptError ? (
								<p
									role="alert"
									className="text-sm text-red-600 dark:text-red-400"
								>
									{acceptError}
								</p>
							) : null}
							<div className="overflow-hidden rounded-2xl border border-blue_munsell-200 bg-blue_munsell-50/30 dark:border-blue_munsell-800 dark:bg-blue_munsell-950/20">
								{incomingInvitations.map((invitation) => (
									<div
										key={invitation.id}
										className="flex flex-col gap-3 border-b border-blue_munsell-100 p-4 last:border-b-0 sm:flex-row sm:items-center dark:border-blue_munsell-900"
									>
										<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-blue_munsell-600 shadow-sm dark:bg-outer_space-400 dark:text-blue_munsell-300">
											<Building2 size={19} />
										</span>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-outer_space-900 dark:text-platinum-50">
												{invitation.publicOrganizationData.name}
											</p>
											<p className="truncate text-sm text-paynes_gray-500">
												Invited as {invitation.role.replace("org:", "")}
											</p>
										</div>
										<Button
											onClick={() => acceptInvitation(invitation)}
											disabled={isAccepting}
										>
											{acceptingId === invitation.id
												? "Accepting…"
												: "Accept invitation"}
										</Button>
									</div>
								))}
							</div>
						</section>
					) : null}
					{invitations.length > 0 ? (
						<section className="space-y-3">
							<div>
								<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
									Sent invitations
								</h2>
								<p className="text-sm text-paynes_gray-500">
									Waiting for these people to join this workspace.
								</p>
							</div>
							<PendingInvitations invitations={invitations} />
						</section>
					) : null}
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
