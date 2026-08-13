import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, findUserByClerkId, getProjectAccess } from "@/lib/db"
import { users } from "@/lib/db/schema"
import type { MemberRole } from "@/types"

export async function syncCurrentUser() {
	const { userId } = await auth()
	if (!userId) return null

	const existing = await findUserByClerkId(userId)
	if (existing) return existing

	const clerkUser = await currentUser()
	if (!clerkUser) return null

	const email =
		clerkUser.primaryEmailAddress?.emailAddress ??
		clerkUser.emailAddresses[0]?.emailAddress ??
		`${userId}@users.local`
	const name =
		[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
		clerkUser.username ||
		email.split("@")[0] ||
		"ProjectFlow user"

	const [savedUser] = await db
		.insert(users)
		.values({
			clerkId: userId,
			email,
			name,
			avatarUrl: clerkUser.imageUrl,
		})
		.onConflictDoUpdate({
			target: users.clerkId,
			set: {
				email,
				name,
				avatarUrl: clerkUser.imageUrl,
				updatedAt: new Date(),
			},
		})
		.returning()

	return savedUser
}

export async function requireDbUser() {
	const { userId } = await auth()
	if (!userId) redirect("/sign-in")

	const existing = await findUserByClerkId(userId)
	if (existing) return existing

	const synced = await syncCurrentUser()
	if (!synced) redirect("/sign-in")
	return synced
}

export async function requireProjectAccess(projectId: string) {
	const user = await requireDbUser()
	const access = await getProjectAccess(projectId, user.id)
	if (!access) return null
	return { ...access, user }
}

export function requireProjectRole(role: MemberRole, allowed: MemberRole[]) {
	if (!allowed.includes(role)) {
		throw new Error("You do not have permission to perform this action.")
	}
}

export async function deleteSyncedUser(clerkId: string) {
	await db.delete(users).where(eq(users.clerkId, clerkId))
}
