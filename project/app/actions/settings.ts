"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getWorkspaceContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { ActionResult } from "@/types";

const profileSchema = z.object({
	firstName: z.string().trim().min(1).max(64),
	lastName: z.string().trim().max(64),
});

export async function updateProfileAction(
	_previous: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const context = await getWorkspaceContext();
	const parsed = profileSchema.safeParse({
		firstName: formData.get("firstName"),
		lastName: formData.get("lastName"),
	});
	if (!parsed.success)
		return {
			success: false,
			message: "Enter a valid first and last name.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		};
	try {
		const client = await clerkClient();
		const clerkUser = await client.users.updateUser(
			context.clerkUserId,
			parsed.data,
		);
		const name = [clerkUser.firstName, clerkUser.lastName]
			.filter(Boolean)
			.join(" ");
		await db
			.update(users)
			.set({ name, updatedAt: new Date() })
			.where(eq(users.clerkId, context.clerkUserId));
		revalidatePath("/", "layout");
		return { success: true, message: "Profile updated." };
	} catch (error) {
		console.error("Unable to update Clerk profile", error);
		return {
			success: false,
			message: "Unable to update your profile. Please try again.",
		};
	}
}
