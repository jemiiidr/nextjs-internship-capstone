"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getWorkspaceContext, requireWorkspaceContext } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { hasPermission } from "@/lib/rbac";
import { workspaceInvitationSchema } from "@/lib/validations";
import {
	getWorkspaceMembers,
	getWorkspaceSummary,
	userBelongsToWorkspace,
} from "@/lib/workspaces";
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
	if (!hasPermission(context.role, "team:manage")) {
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
	if (!hasPermission(context.role, "team:manage")) {
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

export async function removeWorkspaceMemberAction(
	memberClerkId: string,
): Promise<ActionResult> {
	const context = await requireWorkspaceContext();
	if (!hasPermission(context.role, "team:manage")) {
		return {
			success: false,
			message: "Only workspace owners and admins can remove members.",
		};
	}
	if (!/^user_[A-Za-z0-9]+$/.test(memberClerkId)) {
		return { success: false, message: "Invalid team member." };
	}
	if (memberClerkId === context.clerkUserId) {
		return { success: false, message: "You cannot remove yourself." };
	}

	try {
		const client = await clerkClient();
		const organization = await client.organizations.getOrganization({
			organizationId: context.workspaceId,
		});
		if (organization.createdBy === memberClerkId) {
			return {
				success: false,
				message: "The workspace owner cannot be removed.",
			};
		}

		const membership = await userBelongsToWorkspace(
			context.workspaceId,
			memberClerkId,
		);
		if (!membership) {
			return {
				success: false,
				message: "That member is no longer in the team.",
			};
		}
		if (membership.role === "org:admin" && context.role !== "owner") {
			return {
				success: false,
				message: "Only the workspace owner can remove an admin.",
			};
		}

		await client.organizations.deleteOrganizationMembership({
			organizationId: context.workspaceId,
			userId: memberClerkId,
		});
		revalidatePath("/", "layout");
		revalidatePath("/team");
		return { success: true, message: "Member removed." };
	} catch (error) {
		console.error("Unable to remove Clerk organization member", error);
		return {
			success: false,
			message: "Kanvas could not remove this member. Please try again.",
		};
	}
}

export async function updateWorkspaceMemberRoleAction(
	memberClerkId: string,
	role: "org:admin" | "org:member",
): Promise<ActionResult> {
	const context = await requireWorkspaceContext();
	if (!hasPermission(context.role, "team:manage")) {
		return {
			success: false,
			message: "Only workspace owners and admins can change member roles.",
		};
	}
	if (!/^user_[A-Za-z0-9]+$/.test(memberClerkId)) {
		return { success: false, message: "Invalid team member." };
	}
	if (memberClerkId === context.clerkUserId) {
		return { success: false, message: "You cannot change your own role." };
	}
	if (role !== "org:admin" && role !== "org:member") {
		return { success: false, message: "Invalid workspace role." };
	}

	try {
		const client = await clerkClient();
		const organization = await client.organizations.getOrganization({
			organizationId: context.workspaceId,
		});
		if (organization.createdBy === memberClerkId) {
			return {
				success: false,
				message: "The workspace owner's role cannot be changed.",
			};
		}

		const membership = await userBelongsToWorkspace(
			context.workspaceId,
			memberClerkId,
		);
		if (!membership) {
			return {
				success: false,
				message: "That member is no longer in the team.",
			};
		}
		if (
			membership.role === "org:admin" &&
			role === "org:member" &&
			context.role !== "owner"
		) {
			return {
				success: false,
				message: "Only the workspace owner can demote an admin.",
			};
		}

		await client.organizations.updateOrganizationMembership({
			organizationId: context.workspaceId,
			userId: memberClerkId,
			role,
		});
		revalidatePath("/", "layout");
		revalidatePath("/team");
		return {
			success: true,
			message:
				role === "org:admin"
					? "Member promoted to admin."
					: "Admin changed to member.",
		};
	} catch (error) {
		console.error("Unable to update Clerk organization member role", error);
		return {
			success: false,
			message: "Kanvas could not update this member's role. Please try again.",
		};
	}
}

export async function notifyWorkspaceJoinedAction(
	workspaceId: string,
	revalidate = true,
): Promise<ActionResult> {
	const context = await getWorkspaceContext();
	if (!/^org_[A-Za-z0-9]+$/.test(workspaceId)) {
		return { success: false, message: "Invalid workspace." };
	}
	const membership = await userBelongsToWorkspace(
		workspaceId,
		context.clerkUserId,
	);
	if (!membership) {
		return { success: false, message: "Workspace membership was not found." };
	}

	const [workspace, members] = await Promise.all([
		getWorkspaceSummary(workspaceId, membership.role),
		getWorkspaceMembers(workspaceId),
	]);
	await Promise.all(
		members
			.filter((member) => member.clerkId !== context.clerkUserId)
			.map((member) =>
				createNotification({
					recipientId: member.id,
					workspaceId,
					type: "member_joined",
					title: "New team member",
					message: `${context.user.name} joined ${workspace.name}.`,
					href: "/team",
					eventKey: `member-joined:${workspaceId}:${context.clerkUserId}`,
				}),
			),
	);
	if (revalidate) {
		revalidatePath("/", "layout");
		revalidatePath("/team");
	}
	return { success: true, message: "Workspace joined." };
}
