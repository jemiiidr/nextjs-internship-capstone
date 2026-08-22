import "server-only";

import { eq, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function upsertClerkUser(input: {
	clerkId: string;
	email: string;
	name: string;
	avatarUrl: string | null;
}) {
	const email = input.email.trim().toLowerCase();
	const values = {
		clerkId: input.clerkId,
		email,
		name: input.name,
		avatarUrl: input.avatarUrl,
		updatedAt: new Date(),
	};

	const existingByClerkId = await db.query.users.findFirst({
		where: eq(users.clerkId, input.clerkId),
	});
	if (existingByClerkId) {
		const [saved] = await db
			.update(users)
			.set(values)
			.where(eq(users.id, existingByClerkId.id))
			.returning();
		return saved;
	}

	// Clerk IDs change when an account is deleted and recreated. Reconnect the
	// existing email row so its project/task relationships remain intact.
	const existingByEmail = await db.query.users.findFirst({
		where: ilike(users.email, email),
	});
	if (existingByEmail) {
		const [saved] = await db
			.update(users)
			.set(values)
			.where(eq(users.id, existingByEmail.id))
			.returning();
		return saved;
	}

	const [saved] = await db
		.insert(users)
		.values(values)
		.onConflictDoUpdate({ target: users.email, set: values })
		.returning();
	return saved;
}
