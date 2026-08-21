import "server-only";

import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type {
	MemberRole,
	UserSummary,
	WorkspaceMember,
	WorkspaceSummary,
} from "@/types";

export function normalizeWorkspaceRole(
	role: string | null | undefined,
): Exclude<MemberRole, "owner"> {
	if (role === "org:admin") return "admin";
	if (role === "org:viewer") return "viewer";
	return "member";
}

async function upsertWorkspaceUser(input: {
	clerkId: string;
	email: string;
	name: string;
	avatarUrl: string | null;
}) {
	const [saved] = await db
		.insert(users)
		.values(input)
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				email: input.email,
				name: input.name,
				avatarUrl: input.avatarUrl,
				updatedAt: new Date(),
			},
		})
		.returning();
	return saved;
}

export async function getUserWorkspaces(
	clerkUserId: string,
): Promise<WorkspaceSummary[]> {
	const client = await clerkClient();
	const { data: memberships } =
		await client.users.getOrganizationMembershipList({
			userId: clerkUserId,
			limit: 100,
		});

	if (memberships.length === 0) return [];

	const organizationIds = memberships.map(
		(membership) => membership.organization.id,
	);
	const { data: organizations } =
		await client.organizations.getOrganizationList({
			organizationId: organizationIds,
			includeMembersCount: true,
			limit: organizationIds.length,
		});
	const organizationsById = new Map(
		organizations.map((organization) => [organization.id, organization]),
	);

	return memberships.map((membership) => {
		const organization =
			organizationsById.get(membership.organization.id) ??
			membership.organization;
		return {
			id: organization.id,
			name: organization.name,
			slug: organization.slug ?? null,
			imageUrl: organization.imageUrl ?? null,
			role: normalizeWorkspaceRole(membership.role),
			roleKey: membership.role,
			memberCount: organization.membersCount ?? 0,
		};
	});
}

export async function getWorkspaceSummary(
	workspaceId: string,
	roleKey: string | null | undefined,
): Promise<WorkspaceSummary> {
	const client = await clerkClient();
	const organization = await client.organizations.getOrganization({
		organizationId: workspaceId,
		includeMembersCount: true,
	});
	return {
		id: organization.id,
		name: organization.name,
		slug: organization.slug ?? null,
		imageUrl: organization.imageUrl ?? null,
		role: normalizeWorkspaceRole(roleKey),
		roleKey: roleKey ?? "org:member",
		memberCount: organization.membersCount ?? 0,
	};
}

export async function getWorkspaceMemberPreview(
	workspaceId: string,
	limit = 4,
): Promise<UserSummary[]> {
	const client = await clerkClient();
	const { data } = await client.organizations.getOrganizationMembershipList({
		organizationId: workspaceId,
		limit: Math.min(Math.max(limit, 1), 10),
		orderBy: "+first_name",
	});
	return data.flatMap((membership) => {
		const publicData = membership.publicUserData;
		if (!publicData?.userId) return [];
		const email = publicData.identifier || `${publicData.userId}@users.local`;
		const name =
			[publicData.firstName, publicData.lastName].filter(Boolean).join(" ") ||
			email.split("@")[0] ||
			"Flowora member";
		return [
			{
				id: publicData.userId,
				name,
				email,
				avatarUrl: publicData.imageUrl ?? null,
			},
		];
	});
}

export async function getWorkspaceMembers(
	workspaceId: string,
): Promise<WorkspaceMember[]> {
	const client = await clerkClient();
	const { data } = await client.organizations.getOrganizationMembershipList({
		organizationId: workspaceId,
		limit: 100,
		orderBy: "+first_name",
	});

	const members = await Promise.all(
		data.map(async (membership) => {
			const publicData = membership.publicUserData;
			if (!publicData?.userId) return null;
			const email = publicData.identifier || `${publicData.userId}@users.local`;
			const name =
				[publicData.firstName, publicData.lastName].filter(Boolean).join(" ") ||
				email.split("@")[0] ||
				"Flowora member";
			const dbUser = await upsertWorkspaceUser({
				clerkId: publicData.userId,
				email,
				name,
				avatarUrl: publicData.imageUrl ?? null,
			});
			return {
				id: dbUser.id,
				clerkId: publicData.userId,
				name: dbUser.name,
				email: dbUser.email,
				avatarUrl: dbUser.avatarUrl,
				role: normalizeWorkspaceRole(membership.role),
				roleKey: membership.role,
			} satisfies WorkspaceMember;
		}),
	);

	return members.filter((member): member is WorkspaceMember => Boolean(member));
}

export async function userBelongsToWorkspace(
	workspaceId: string,
	clerkUserId: string,
) {
	const client = await clerkClient();
	const { data } = await client.organizations.getOrganizationMembershipList({
		organizationId: workspaceId,
		userId: [clerkUserId],
		limit: 1,
	});
	return data[0] ?? null;
}

export async function findDbUserByClerkId(clerkId: string) {
	return db.query.users.findFirst({ where: eq(users.clerkId, clerkId) });
}
