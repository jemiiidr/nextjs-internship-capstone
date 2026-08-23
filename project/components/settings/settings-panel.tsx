"use client";

import { useClerk, useReverification, useUser } from "@clerk/nextjs";
import {
	Bell,
	Building2,
	KeyRound,
	Loader2,
	LogOut,
	Palette,
	UserRound,
	Users,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useActionState, useState } from "react";
import { updateProfileAction } from "@/app/actions/settings";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult, UserSummary } from "@/types";

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
	const { signOut } = useClerk();
	const [profileState, profileAction, profilePending] = useActionState(
		updateProfileAction,
		initialState,
	);
	const [passwordPending, setPasswordPending] = useState(false);
	const [passwordMessage, setPasswordMessage] = useState("");

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
		<div className="grid gap-6 xl:grid-cols-2">
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
	);
}
