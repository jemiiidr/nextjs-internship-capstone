"use client";

import { useClerk, useReverification, useUser } from "@clerk/nextjs";
import {
	Bell,
	Building2,
	Clock3,
	Copy,
	ExternalLink,
	KeyRound,
	Loader2,
	LogOut,
	Palette,
	ShieldCheck,
	Smartphone,
	Trash2,
	UserRound,
	Users,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useActionState, useCallback, useEffect, useState } from "react";
import { updateProfileAction } from "@/app/actions/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Modal } from "@/components/ui/modal";
import type { ActionResult, UserSummary } from "@/types";

type AccountSession = Awaited<ReturnType<NonNullable<ReturnType<typeof useUser>["user"]>["getSessions"]>>[number];
type AuthenticatorSetup = Awaited<ReturnType<NonNullable<ReturnType<typeof useUser>["user"]>["createTOTP"]>>;

const initialState: ActionResult = { success: false, message: "" };

function ResultMessage({ state }: { state: ActionResult }) {
	if (!state.message) return null;
	return (
		<p
			role="status"
			className={
				state.success
					? "text-sm text-emerald-600 dark:text-emerald-300"
					: "text-sm text-red-600 dark:text-red-300"
			}
		>
			{state.message}
		</p>
	);
}

export function SettingsPanel({ user: initialUser }: { user: UserSummary }) {
	const { user } = useUser();
	const { signOut, session } = useClerk();
	const [profileState, profileAction, profilePending] = useActionState(
		updateProfileAction,
		initialState,
	);
	const [passwordPending, setPasswordPending] = useState(false);
	const [passwordMessage, setPasswordMessage] = useState("");
	const [totp, setTotp] = useState<AuthenticatorSetup | null>(null);
	const [totpOpen, setTotpOpen] = useState(false);
	const [totpPending, setTotpPending] = useState(false);
	const [totpMessage, setTotpMessage] = useState("");
	const [sessions, setSessions] = useState<AccountSession[]>([]);
	const [sessionsPending, setSessionsPending] = useState(true);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deletePending, setDeletePending] = useState(false);
	const [deleteError, setDeleteError] = useState("");

	const loadSessions = useCallback(async () => {
		if (!user) return;
		setSessionsPending(true);
		try { setSessions(await user.getSessions()); } finally { setSessionsPending(false); }
	}, [user]);

	useEffect(() => { void loadSessions(); }, [loadSessions]);

	const createTotpWithReverification = useReverification(async () => {
		if (!user) throw new Error("Your account is still loading.");
		return user.createTOTP();
	});
	const disableTotpWithReverification = useReverification(async () => {
		if (!user) throw new Error("Your account is still loading.");
		return user.disableTOTP();
	});
	const deleteAccountWithReverification = useReverification(async () => {
		if (!user) throw new Error("Your account is still loading.");
		return user.delete();
	});

	const beginTotp = async () => {
		setTotpPending(true); setTotpMessage("");
		try { setTotp(await createTotpWithReverification()); setTotpOpen(true); }
		catch (error) { setTotpMessage(error instanceof Error ? error.message : "Unable to start setup."); }
		finally { setTotpPending(false); }
	};

	const verifyTotp = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user) return;
		setTotpPending(true); setTotpMessage("");
		try {
			const code = String(new FormData(event.currentTarget).get("code") ?? "");
			const verified = await user.verifyTOTP({ code });
			setTotp(verified); await user.reload();
			setTotpMessage("Two-step authentication is enabled. Save your backup codes safely.");
		} catch (error) { setTotpMessage(error instanceof Error ? error.message : "That code could not be verified."); }
		finally { setTotpPending(false); }
	};

	const disableTotp = async () => {
		setTotpPending(true); setTotpMessage("");
		try { await disableTotpWithReverification(); await user?.reload(); setTotp(null); setTotpMessage("Two-step authentication disabled."); }
		catch (error) { setTotpMessage(error instanceof Error ? error.message : "Unable to disable two-step authentication."); }
		finally { setTotpPending(false); }
	};

	const deleteAccount = async () => {
		setDeletePending(true); setDeleteError("");
		try { await deleteAccountWithReverification(); await signOut({ redirectUrl: "/" }); }
		catch (error) { setDeleteError(error instanceof Error ? error.message : "Unable to delete your account."); setDeletePending(false); }
	};

	const updatePasswordWithReverification = useReverification(
		async (currentPassword: string, newPassword: string) => {
			if (!user) throw new Error("Your account is still loading.");
			return user.updatePassword({
				currentPassword,
				newPassword,
				signOutOfOtherSessions: true,
			});
		},
	);

	const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user) return;
		const form = new FormData(event.currentTarget);
		const currentPassword = String(form.get("currentPassword") ?? "");
		const newPassword = String(form.get("newPassword") ?? "");
		if (newPassword.length < 8)
			return setPasswordMessage(
				"New password must contain at least 8 characters.",
			);
		setPasswordPending(true);
		setPasswordMessage("");
		try {
			await updatePasswordWithReverification(currentPassword, newPassword);
			event.currentTarget.reset();
			setPasswordMessage("Password updated. Other sessions were signed out.");
		} catch (error) {
			setPasswordMessage(
				error instanceof Error ? error.message : "Unable to update password.",
			);
		} finally {
			setPasswordPending(false);
		}
	};

	return (
		<><div className="grid gap-6 xl:grid-cols-2">
			<Card>
				<CardContent className="space-y-5 p-6">
					<div className="flex items-center gap-3">
						<Avatar
							name={initialUser.name}
							src={user?.imageUrl ?? initialUser.avatarUrl}
							className="size-12"
						/>
						<div>
							<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
								Personal profile
							</h2>
							<p className="text-sm text-paynes_gray-500">
								{initialUser.email}
							</p>
						</div>
					</div>
					<form action={profileAction} className="space-y-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="firstName">First name</Label>
								<Input
									id="firstName"
									name="firstName"
									defaultValue={
										user?.firstName ?? initialUser.name.split(" ")[0]
									}
									required
									maxLength={64}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="lastName">Last name</Label>
								<Input
									id="lastName"
									name="lastName"
									defaultValue={
										user?.lastName ??
										initialUser.name.split(" ").slice(1).join(" ")
									}
									maxLength={64}
								/>
							</div>
						</div>
						<ResultMessage state={profileState} />
						<Button disabled={profilePending}>
							{profilePending ? (
								<Loader2 size={16} className="animate-spin" />
							) : (
								<UserRound size={16} />
							)}{" "}
							Save profile
						</Button>
					</form>
				</CardContent>
			</Card>
			<Card>
				<CardContent className="space-y-5 p-6">
					<div className="flex items-start gap-3">
						<span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300"><ShieldCheck size={18} /></span>
						<div><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Two-step authentication</h2><p className="mt-1 text-sm text-paynes_gray-500">Protect sign-in with a code from your authenticator app.</p></div>
					</div>
					{totpMessage ? <p role="status" className="text-sm text-paynes_gray-500">{totpMessage}</p> : null}
					{user?.totpEnabled ? (
						<Button variant="secondary" onClick={disableTotp} disabled={totpPending}><ShieldCheck size={16} />{totpPending ? "Updating…" : "Disable authenticator"}</Button>
					) : (
						<Button onClick={beginTotp} disabled={!user || totpPending}><Smartphone size={16} />{totpPending ? "Starting…" : "Set up authenticator"}</Button>
					)}
				</CardContent>
			</Card>
			<Card>
				<CardContent className="space-y-5 p-6">
					<div><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Login sessions</h2><p className="mt-1 text-sm text-paynes_gray-500">Review devices signed in to your account and revoke access.</p></div>
					<div className="space-y-2">
						{sessionsPending ? <p className="text-sm text-paynes_gray-500">Loading sessions…</p> : sessions.map((item) => (
							<div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-french_gray-200 p-3 dark:border-paynes_gray-800">
								<div className="min-w-0"><p className="truncate text-sm font-medium text-outer_space-900 dark:text-platinum-50">{item.latestActivity.browserName || "Browser"} · {item.latestActivity.deviceType || "Device"}{item.id === session?.id ? " (current)" : ""}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-paynes_gray-500"><Clock3 size={12} /> Active {item.lastActiveAt.toLocaleString()}</p></div>
								{item.id !== session?.id ? <Button size="sm" variant="secondary" onClick={async () => { await item.revoke(); await loadSessions(); }}>Revoke</Button> : null}
							</div>
						))}
					</div>
				</CardContent>
			</Card>
			<Card className="border-red-200 dark:border-red-950">
				<CardContent className="space-y-4 p-6"><div><h2 className="font-semibold text-red-700 dark:text-red-300">Delete account</h2><p className="mt-1 text-sm text-paynes_gray-500">Permanently remove your Clerk account and revoke all login sessions. This cannot be undone.</p></div><Button variant="danger" onClick={() => setDeleteOpen(true)} disabled={!user?.deleteSelfEnabled}><Trash2 size={16} /> Delete account</Button>{user && !user.deleteSelfEnabled ? <p className="text-xs text-paynes_gray-500">Self-service account deletion is disabled by the administrator.</p> : null}</CardContent>
			</Card>
			<Card>
				<CardContent className="space-y-5 p-6">
					<div>
						<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
							Security
						</h2>
						<p className="mt-1 text-sm text-paynes_gray-500">
							Change your password and close other active sessions.
						</p>
					</div>
					{user?.passwordEnabled ? (
						<form onSubmit={updatePassword} className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="currentPassword">Current password</Label>
								<Input
									id="currentPassword"
									name="currentPassword"
									type="password"
									autoComplete="current-password"
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="newPassword">New password</Label>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									autoComplete="new-password"
									minLength={8}
									required
								/>
							</div>
							{passwordMessage ? (
								<p role="status" className="text-sm text-paynes_gray-500">
									{passwordMessage}
								</p>
							) : null}
							<Button disabled={passwordPending}>
								{passwordPending ? (
									<Loader2 size={16} className="animate-spin" />
								) : (
									<KeyRound size={16} />
								)}{" "}
								Update password
							</Button>
						</form>
					) : (
						<div className="rounded-xl bg-platinum-100 p-4 text-sm text-paynes_gray-600 dark:bg-outer_space-400 dark:text-french_gray-300">
							Your account signs in through an external provider. Password
							changes are managed by that provider.
						</div>
					)}
					<div className="border-t border-french_gray-200 pt-4 dark:border-paynes_gray-800">
						<Button
							variant="secondary"
							onClick={() => void signOut({ redirectUrl: "/sign-in" })}
						>
							<LogOut size={16} /> Sign out
						</Button>
					</div>
				</CardContent>
			</Card>
			<Card className="xl:col-span-2">
				<CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,.8fr)]">
					<div>
						<div className="flex items-center gap-3">
							<span className="grid size-10 place-items-center rounded-xl bg-blue_munsell-50 text-blue_munsell-600 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-300">
								<Palette size={18} />
							</span>
							<div>
								<h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">
									Appearance
								</h2>
								<p className="text-sm text-paynes_gray-500">
									Choose the interface theme used across Flowora.
								</p>
							</div>
						</div>
						<div className="mt-4 max-w-xs">
							<ThemeToggle />
						</div>
					</div>
					<div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
						<Link
							href="/notifications"
							className="flex items-center gap-3 rounded-xl border border-french_gray-200 p-3 text-sm font-medium hover:border-blue_munsell-300 dark:border-paynes_gray-800"
						>
							<Bell size={16} className="text-blue_munsell-500" /> Notification
							inbox
						</Link>
						<Link
							href="/team"
							className="flex items-center gap-3 rounded-xl border border-french_gray-200 p-3 text-sm font-medium hover:border-blue_munsell-300 dark:border-paynes_gray-800"
						>
							<Users size={16} className="text-blue_munsell-500" /> Team access
						</Link>
						<Link
							href="/workspaces"
							className="flex items-center gap-3 rounded-xl border border-french_gray-200 p-3 text-sm font-medium hover:border-blue_munsell-300 dark:border-paynes_gray-800"
						>
							<Building2 size={16} className="text-blue_munsell-500" /> Manage
							workspaces
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
		<Modal open={totpOpen} onClose={() => !totpPending && setTotpOpen(false)} title="Set up an authenticator" description="Add this key to your authenticator app, then enter the generated six-digit code.">
			<form onSubmit={verifyTotp} className="space-y-4">
				<div className="rounded-xl bg-platinum-100 p-4 dark:bg-outer_space-400"><p className="text-xs font-medium uppercase tracking-wide text-paynes_gray-500">Setup key</p><div className="mt-2 flex items-center gap-2"><code className="min-w-0 flex-1 break-all text-sm">{totp?.secret}</code><Button type="button" size="icon" variant="ghost" aria-label="Copy setup key" onClick={() => void navigator.clipboard.writeText(totp?.secret ?? "")}><Copy size={16} /></Button></div>{totp?.uri ? <a href={totp.uri} className="mt-3 inline-flex items-center gap-1 text-sm text-blue_munsell-600 dark:text-blue_munsell-300"><ExternalLink size={14} /> Open authenticator app</a> : null}</div>
				{!totp?.verified ? <><div className="space-y-1.5"><Label htmlFor="totp-code">Verification code</Label><Input id="totp-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required /></div><Button type="submit" disabled={totpPending}>{totpPending ? "Verifying…" : "Verify and enable"}</Button></> : null}
				{totpMessage ? <p role="status" className="text-sm text-paynes_gray-500">{totpMessage}</p> : null}
				{totp?.backupCodes?.length ? <div className="grid grid-cols-2 gap-2 rounded-xl border border-french_gray-200 p-4 font-mono text-xs dark:border-paynes_gray-800">{totp.backupCodes.map((code: string) => <span key={code}>{code}</span>)}</div> : null}
			</form>
		</Modal>
		<ConfirmationModal open={deleteOpen} onClose={() => !deletePending && setDeleteOpen(false)} onConfirm={deleteAccount} title="Delete your account?" confirmLabel="Permanently delete account" pending={deletePending} error={deleteError}><p>This permanently deletes your identity and signs you out of every device. Workspace data owned by your account may also become inaccessible.</p></ConfirmationModal>
		</>
	);
}
