"use client";

import { useOrganizationList } from "@clerk/nextjs";
import {
	Building2,
	ChevronLeft,
	ChevronRight,
	Info,
	MailPlus,
	MoreHorizontal,
	Search,
	ShieldCheck,
	Trash2,
	UserRound,
	Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	useActionState,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";
import {
	inviteWorkspaceMemberAction,
	notifyWorkspaceJoinedAction,
	removeWorkspaceMemberAction,
	revokeWorkspaceInvitationAction,
	updateWorkspaceMemberRoleAction,
} from "@/app/actions/team";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn, formatDate } from "@/lib/utils";
import type {
	ActionResult,
	MemberRole,
	WorkspaceInvitation,
	WorkspaceMember,
} from "@/types";

const PAGE_SIZE = 6;
const initialState: ActionResult = { success: false, message: "" };

function roleClasses(
	role: WorkspaceMember["role"] | WorkspaceInvitation["role"],
) {
	if (role === "admin")
		return "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200";
	if (role === "owner")
		return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200";
	if (role === "viewer")
		return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200";
	return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200";
}

function RolePill({
	role,
}: {
	role: WorkspaceMember["role"] | WorkspaceInvitation["role"];
}) {
	return (
		<span
			className={cn(
				"inline-flex rounded-md px-2.5 py-1 text-xs font-medium capitalize",
				roleClasses(role),
			)}
		>
			{role}
		</span>
	);
}

function InviteMemberButton({ workspaceName }: { workspaceName: string }) {
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
			<Button onClick={() => setOpen(true)} className="shrink-0 px-5">
				<MailPlus size={16} /> Invite member
			</Button>
			<Modal
				open={open}
				onClose={() => {
					if (!pending) setOpen(false);
				}}
				title="Invite member"
				description={`Add a new member to ${workspaceName}.`}
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
							placeholder="Enter email address"
							autoFocus
						/>
						<p className="text-xs text-paynes_gray-500">
							We’ll send an invitation to this email address.
						</p>
						{state.fieldErrors?.email?.[0] ? (
							<p className="text-xs text-red-600">
								{state.fieldErrors.email[0]}
							</p>
						) : null}
					</div>
					<div className="space-y-2">
						<Label htmlFor="invite-role">Role</Label>
						<Select
							id="invite-role"
							name="role"
							defaultValue="org:member"
							options={[
								{ value: "org:member", label: "Member" },
								{ value: "org:admin", label: "Admin" },
							]}
						/>
						<div className="space-y-1 rounded-xl border border-french_gray-200 bg-platinum-50/60 p-2 dark:border-paynes_gray-700 dark:bg-outer_space-400">
							<div className="flex gap-2 rounded-lg p-2">
								<ShieldCheck size={16} className="mt-0.5 text-violet-600" />
								<div>
									<p className="text-xs font-semibold">Admin</p>
									<p className="text-[11px] text-paynes_gray-500">
										Can manage workspace settings, members, and projects.
									</p>
								</div>
							</div>
							<div className="flex gap-2 rounded-lg p-2">
								<UserRound size={16} className="mt-0.5 text-blue-600" />
								<div>
									<p className="text-xs font-semibold">Member</p>
									<p className="text-[11px] text-paynes_gray-500">
										Can create and collaborate on projects and tasks.
									</p>
								</div>
							</div>
						</div>
					</div>
					{state.message && !state.success ? (
						<p role="alert" className="text-sm text-red-600 dark:text-red-400">
							{state.message}
						</p>
					) : null}
					<div className="grid grid-cols-2 gap-2">
						<Button
							type="button"
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

function Pagination({
	page,
	pages,
	onChange,
}: {
	page: number;
	pages: number;
	onChange: (page: number) => void;
}) {
	if (pages <= 1) return null;
	return (
		<div className="flex items-center gap-1">
			<button
				type="button"
				aria-label="Previous page"
				disabled={page === 1}
				onClick={() => onChange(page - 1)}
				className="grid size-8 place-items-center rounded-md text-paynes_gray-500 hover:bg-platinum-100 disabled:opacity-30 dark:hover:bg-outer_space-300"
			>
				<ChevronLeft size={15} />
			</button>
			{Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
				<button
					key={number}
					type="button"
					onClick={() => onChange(number)}
					className={cn(
						"size-8 rounded-md text-sm",
						number === page
							? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200"
							: "text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300",
					)}
				>
					{number}
				</button>
			))}
			<button
				type="button"
				aria-label="Next page"
				disabled={page === pages}
				onClick={() => onChange(page + 1)}
				className="grid size-8 place-items-center rounded-md text-paynes_gray-500 hover:bg-platinum-100 disabled:opacity-30 dark:hover:bg-outer_space-300"
			>
				<ChevronRight size={15} />
			</button>
		</div>
	);
}

function SentInvitations({
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
	return (
		<>
			<section className="overflow-hidden rounded-2xl border border-french_gray-300 bg-white shadow-sm dark:border-paynes_gray-800 dark:bg-outer_space-500">
				<div className="flex items-center gap-2 px-6 py-5">
					<h2 className="text-lg font-semibold">Pending invitations</h2>
					<span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
						{invitations.length}
					</span>
				</div>
				<div className="overflow-x-auto px-6">
					<div className="min-w-[650px]">
						<div className="grid grid-cols-[1.7fr_.7fr_1fr_.7fr] border-b border-french_gray-200 px-2 pb-3 text-xs text-paynes_gray-500 dark:border-paynes_gray-800">
							<span>Email</span>
							<span>Role</span>
							<span>Sent</span>
							<span className="text-right">Actions</span>
						</div>
						{invitations.map((invitation) => (
							<div
								key={invitation.id}
								className="grid grid-cols-[1.7fr_.7fr_1fr_.7fr] items-center border-b border-french_gray-200 px-2 py-3 text-sm last:border-b-0 dark:border-paynes_gray-800"
							>
								<span className="truncate text-paynes_gray-600 dark:text-french_gray-300">
									{invitation.email}
								</span>
								<span>
									<RolePill role={invitation.role} />
								</span>
								<span className="text-paynes_gray-500">
									{formatDate(invitation.createdAt)}
								</span>
								<button
									type="button"
									onClick={() => {
										setError("");
										setSelected(invitation);
									}}
									className="justify-self-end text-xs font-medium text-rose-600 hover:underline dark:text-rose-300"
								>
									Revoke
								</button>
							</div>
						))}
						{invitations.length === 0 ? (
							<p className="py-8 text-center text-sm text-paynes_gray-500">
								No pending invitations.
							</p>
						) : null}
					</div>
				</div>
				<div className="border-t border-french_gray-200 px-6 py-4 text-xs text-paynes_gray-500 dark:border-paynes_gray-800">
					Showing {invitations.length} invitation
					{invitations.length === 1 ? "" : "s"}
				</div>
			</section>
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
					<strong>{selected?.email}</strong> will no longer be able to join with
					this invitation.
				</p>
			</ConfirmationModal>
		</>
	);
}

export function TeamManagement({
	workspaceName,
	members,
	invitations,
	currentUserId,
	currentUserRole,
	canManageMembers,
}: {
	workspaceName: string;
	members: WorkspaceMember[];
	invitations: WorkspaceInvitation[];
	currentUserId: string;
	currentUserRole: MemberRole;
	canManageMembers: boolean;
}) {
	const [query, setQuery] = useState("");
	const [role, setRole] = useState("all");
	const [page, setPage] = useState(1);
	const [openActionsId, setOpenActionsId] = useState<string | null>(null);
	const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(
		null,
	);
	const [removeError, setRemoveError] = useState("");
	const [isRemoving, startRemoving] = useTransition();
	const [roleActionError, setRoleActionError] = useState("");
	const [isChangingRole, startChangingRole] = useTransition();
	const router = useRouter();
	const [acceptError, setAcceptError] = useState("");
	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [isAccepting, startAccepting] = useTransition();
	const { isLoaded, setActive, userInvitations } = useOrganizationList({
		userInvitations: { status: "pending", infinite: true, pageSize: 20 },
	});
	const incoming = userInvitations.data ?? [];
	const filtered = useMemo(
		() =>
			members.filter(
				(member) =>
					(role === "all" || member.role === role) &&
					`${member.name} ${member.email}`
						.toLowerCase()
						.includes(query.trim().toLowerCase()),
			),
		[members, query, role],
	);
	const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
	const safePage = Math.min(page, pages);
	const visible = filtered.slice(
		(safePage - 1) * PAGE_SIZE,
		safePage * PAGE_SIZE,
	);
	const removeMember = () => {
		if (!memberToRemove) return;
		setRemoveError("");
		startRemoving(async () => {
			const result = await removeWorkspaceMemberAction(memberToRemove.clerkId);
			if (result.success) {
				setMemberToRemove(null);
				setOpenActionsId(null);
				router.refresh();
			} else {
				setRemoveError(result.message);
			}
		});
	};
	const changeRole = (
		member: WorkspaceMember,
		role: "org:admin" | "org:member",
	) => {
		setRoleActionError("");
		startChangingRole(async () => {
			const result = await updateWorkspaceMemberRoleAction(
				member.clerkId,
				role,
			);
			if (result.success) {
				setOpenActionsId(null);
				router.refresh();
			} else {
				setRoleActionError(result.message);
			}
		});
	};

	const acceptInvitation = (invitation: (typeof incoming)[number]) => {
		if (!setActive) return;
		setAcceptError("");
		setAcceptingId(invitation.id);
		startAccepting(async () => {
			try {
				await invitation.accept();
				await userInvitations.revalidate();
				await setActive({ organization: invitation.publicOrganizationData.id });
				await notifyWorkspaceJoinedAction(invitation.publicOrganizationData.id);
				router.push("/team");
				router.refresh();
			} catch {
				setAcceptError(
					"Kanvas could not accept this invitation. Please try again.",
				);
			} finally {
				setAcceptingId(null);
			}
		});
	};

	return (
		<div className="space-y-4">
			<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
						Team
					</h1>
					<p className="mt-1 text-paynes_gray-500">
						Manage your team members, roles, and invitations.
					</p>
				</div>
				{canManageMembers ? (
					<InviteMemberButton workspaceName={workspaceName} />
				) : null}
			</header>
			<section className="overflow-hidden rounded-2xl border border-french_gray-300 bg-white shadow-sm dark:border-paynes_gray-800 dark:bg-outer_space-500">
				<div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold">Members</h2>
						<span className="rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
							{members.length}
						</span>
					</div>
					<div className="flex flex-col gap-2 sm:flex-row">
						<div className="relative sm:w-64">
							<Search
								size={15}
								className="absolute left-3 top-1/2 -translate-y-1/2 text-paynes_gray-400"
							/>
							<Input
								value={query}
								onChange={(event) => {
									setQuery(event.target.value);
									setPage(1);
								}}
								placeholder="Search members…"
								className="pl-9"
							/>
						</div>
						<Select
							value={role}
							onValueChange={(value) => {
								setRole(value);
								setPage(1);
							}}
							className="sm:w-36"
							options={[
								{ value: "all", label: "All roles" },
								{ value: "owner", label: "Owner" },
								{ value: "admin", label: "Admin" },
								{ value: "member", label: "Member" },
								{ value: "viewer", label: "Viewer" },
							]}
						/>
					</div>
				</div>
				{roleActionError ? (
					<p
						role="alert"
						className="mx-6 mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300"
					>
						{roleActionError}
					</p>
				) : null}
				<div className="overflow-x-auto px-6">
					<div className="min-w-[720px]">
						<div
							className={cn(
								"grid border-b border-french_gray-200 px-2 pb-3 text-xs text-paynes_gray-500 dark:border-paynes_gray-800",
								canManageMembers
									? "grid-cols-[1.15fr_1.6fr_.55fr_.35fr]"
									: "grid-cols-[1.15fr_1.6fr_.55fr]",
							)}
						>
							<span>Name</span>
							<span>Email</span>
							<span className="flex items-center gap-1">
								Role <Info size={12} />
							</span>
							{canManageMembers ? (
								<span className="text-right">Actions</span>
							) : null}
						</div>
						{visible.map((member, memberIndex) => (
							<div
								key={member.id}
								className={cn(
									"relative grid items-center border-b border-french_gray-200 px-2 py-3 last:border-b-0 dark:border-paynes_gray-800",
									canManageMembers
										? "grid-cols-[1.15fr_1.6fr_.55fr_.35fr]"
										: "grid-cols-[1.15fr_1.6fr_.55fr]",
								)}
							>
								<div className="flex min-w-0 items-center gap-3">
									<Avatar
										name={member.name}
										src={member.avatarUrl}
										className="size-9"
									/>
									<span className="truncate text-sm font-medium">
										{member.name}
									</span>
									{member.id === currentUserId ? (
										<span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-200">
											You
										</span>
									) : null}
								</div>
								<span className="truncate text-sm text-paynes_gray-500">
									{member.email}
								</span>
								<span>
									<RolePill role={member.role} />
								</span>
								{canManageMembers ? (
									<div className="relative justify-self-end">
										<button
											type="button"
											aria-label={`Actions for ${member.name}`}
											aria-expanded={openActionsId === member.id}
											onClick={() =>
												setOpenActionsId((current) =>
													current === member.id ? null : member.id,
												)
											}
											className="grid size-8 place-items-center rounded-md text-paynes_gray-500 hover:bg-platinum-100 dark:hover:bg-outer_space-300"
										>
											<MoreHorizontal size={17} />
										</button>
										{openActionsId === member.id ? (
											<div
												className={cn(
													"absolute right-0 z-30 w-44 rounded-lg border border-french_gray-200 bg-white p-1.5 shadow-lg dark:border-paynes_gray-700 dark:bg-outer_space-400",
													memberIndex >= visible.length - 2
														? "bottom-9"
														: "top-9",
												)}
											>
												{member.role === "owner" ||
												member.id === currentUserId ||
												(member.role === "admin" &&
													currentUserRole !== "owner") ? (
													<p className="px-2 py-1.5 text-xs text-paynes_gray-500">
														{member.role === "owner"
															? "Owner cannot be removed"
															: member.id === currentUserId
																? "You cannot manage yourself"
																: "Only the owner can manage admins"}
													</p>
												) : (
													<>
														{member.role !== "admin" ? (
															<button
																type="button"
																disabled={isChangingRole}
																onClick={() => changeRole(member, "org:admin")}
																className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-platinum-100 disabled:opacity-50 dark:hover:bg-outer_space-300"
															>
																<ShieldCheck size={14} /> Promote to admin
															</button>
														) : currentUserRole === "owner" ? (
															<button
																type="button"
																disabled={isChangingRole}
																onClick={() => changeRole(member, "org:member")}
																className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-platinum-100 disabled:opacity-50 dark:hover:bg-outer_space-300"
															>
																<UserRound size={14} /> Change to member
															</button>
														) : null}
														<div className="my-1 border-t border-french_gray-200 dark:border-paynes_gray-700" />
														<button
															type="button"
															onClick={() => {
																setRemoveError("");
																setMemberToRemove(member);
															}}
															className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/30"
														>
															<Trash2 size={14} /> Remove member
														</button>
													</>
												)}
											</div>
										) : null}
									</div>
								) : null}
							</div>
						))}
						{visible.length === 0 ? (
							<div className="py-12 text-center">
								<Users className="mx-auto text-paynes_gray-400" />
								<p className="mt-2 text-sm text-paynes_gray-500">
									No members match your filters.
								</p>
							</div>
						) : null}
					</div>
				</div>
				<div className="flex items-center justify-between border-t border-french_gray-200 px-6 py-4 text-xs text-paynes_gray-500 dark:border-paynes_gray-800">
					<span>
						{filtered.length
							? `Showing ${(safePage - 1) * PAGE_SIZE + 1} to ${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} members`
							: "Showing 0 members"}
					</span>
					<Pagination page={safePage} pages={pages} onChange={setPage} />
				</div>
			</section>
			{canManageMembers ? <SentInvitations invitations={invitations} /> : null}
			{isLoaded && incoming.length > 0 ? (
				<section className="rounded-2xl border border-blue_munsell-200 bg-blue_munsell-50/30 p-5 dark:border-blue_munsell-800 dark:bg-blue_munsell-950/20">
					<div className="mb-4 flex items-center gap-2">
						<Building2 size={18} className="text-blue_munsell-600" />
						<h2 className="font-semibold">Invitations for you</h2>
					</div>
					{acceptError ? (
						<p className="mb-3 text-sm text-red-600">{acceptError}</p>
					) : null}
					<div className="space-y-2">
						{incoming.map((invitation) => (
							<div
								key={invitation.id}
								className="flex items-center gap-3 rounded-xl bg-white p-3 dark:bg-outer_space-400"
							>
								<div className="min-w-0 flex-1">
									<p className="truncate font-medium">
										{invitation.publicOrganizationData.name}
									</p>
									<p className="text-xs text-paynes_gray-500">
										Invited as {invitation.role.replace("org:", "")}
									</p>
								</div>
								<Button
									size="sm"
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
			<ConfirmationModal
				open={memberToRemove !== null}
				onClose={() => {
					if (!isRemoving) setMemberToRemove(null);
				}}
				onConfirm={removeMember}
				title="Remove member?"
				confirmLabel="Remove member"
				pending={isRemoving}
				error={removeError}
			>
				<p>
					<strong>{memberToRemove?.name}</strong> will lose access to this
					workspace and its projects.
				</p>
			</ConfirmationModal>
		</div>
	);
}
