"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireWorkspaceContext } from "@/lib/auth";
import { workspaceInvitationSchema } from "@/lib/validations";
import type { ActionResult } from "@/types";

function invitationRedirectUrl(requestOrigin: string | null) {
	const configuredOrigin =
		process.env.NEXT_PUBLIC_APP_URL ??
		(process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: requestOrigin);

	if (!configuredOrigin) {
		throw new Error("Set NEXT_PUBLIC_APP_URL to send workspace invitations.");
	}

	const url = new URL(configuredOrigin);
	if (
		url.protocol !== "https:" &&
		url.hostname !== "localhost" &&
		url.hostname !== "127.0.0.1"
	) {
		throw new Error("The invitation URL must use HTTPS.");
	}
	return new URL("/invitations/accept", url).toString();
}

export async function inviteWorkspaceMemberAction(
	_previous: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const context = await requireWorkspaceContext();
	if (context.role !== "admin") {
		return {
			success: false,
			message: "Only workspace admins can invite team members.",
		};
	}

	const parsed = workspaceInvitationSchema.safeParse({
		email: formData.get("email"),
		role: formData.get("role"),
	});
	if (!parsed.success) {
		return {
			success: false,
			message: "Please correct the highlighted fields.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		const requestHeaders = await headers();
		const client = await clerkClient();
		await client.organizations.createOrganizationInvitation({
			organizationId: context.workspaceId,
			emailAddress: parsed.data.email,
			role: parsed.data.role,
			inviterUserId: context.clerkUserId,
			expiresInDays: 7,
			redirectUrl: invitationRedirectUrl(requestHeaders.get("origin")),
		});
		revalidatePath("/team");
		return {
			success: true,
			message: `Invitation sent to ${parsed.data.email}.`,
		};
	} catch (error) {
		console.error("Unable to create Clerk organization invitation", error);
		const message = error instanceof Error ? error.message : "";
		if (/already|duplicate|invited/i.test(message)) {
			return {
				success: false,
				message: "That email is already a member or has a pending invitation.",
			};
		}
		return {
			success: false,
			message: "Clerk could not send the invitation. Please try again.",
		};
	}
}

export async function revokeWorkspaceInvitationAction(
	invitationId: string,
): Promise<ActionResult> {
	const context = await requireWorkspaceContext();
	if (context.role !== "admin") {
		return {
			success: false,
			message: "Only workspace admins can revoke invitations.",
		};
	}
	if (!/^(orginv|inv)_[A-Za-z0-9]+$/.test(invitationId)) {
		return { success: false, message: "Invalid invitation." };
	}

	try {
		const client = await clerkClient();
		await client.organizations.revokeOrganizationInvitation({
			organizationId: context.workspaceId,
			invitationId,
			requestingUserId: context.clerkUserId,
		});
		revalidatePath("/team");
		return { success: true, message: "Invitation revoked." };
	} catch (error) {
		console.error("Unable to revoke Clerk organization invitation", error);
		return {
			success: false,
			message: "Clerk could not revoke the invitation. Please try again.",
		};
	}
}
