import type { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Webhook } from "svix";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function POST(request: Request) {
	const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
	if (!secret) {
		return Response.json(
			{ error: "CLERK_WEBHOOK_SIGNING_SECRET is not configured" },
			{ status: 500 },
		);
	}

	const svixId = request.headers.get("svix-id");
	const svixTimestamp = request.headers.get("svix-timestamp");
	const svixSignature = request.headers.get("svix-signature");
	if (!svixId || !svixTimestamp || !svixSignature) {
		return Response.json({ error: "Missing Svix headers" }, { status: 400 });
	}

	const payload = await request.text();
	let event: WebhookEvent;

	try {
		event = new Webhook(secret).verify(payload, {
			"svix-id": svixId,
			"svix-timestamp": svixTimestamp,
			"svix-signature": svixSignature,
		}) as WebhookEvent;
	} catch (error) {
		console.error("Clerk webhook verification failed", error);
		return Response.json(
			{ error: "Invalid webhook signature" },
			{ status: 400 },
		);
	}

	if (event.type === "user.created" || event.type === "user.updated") {
		const data = event.data;
		const primaryEmail = data.email_addresses.find(
			(email: { id: string; email_address: string }) =>
				email.id === data.primary_email_address_id,
		)?.email_address;
		const email =
			primaryEmail ??
			data.email_addresses[0]?.email_address ??
			`${data.id}@users.local`;
		const name =
			[data.first_name, data.last_name].filter(Boolean).join(" ") ||
			data.username ||
			email.split("@")[0] ||
			"ProjectFlow user";

		await db
			.insert(users)
			.values({
				clerkId: data.id,
				email,
				name,
				avatarUrl: data.image_url,
			})
			.onConflictDoUpdate({
				target: users.clerkId,
				set: {
					email,
					name,
					avatarUrl: data.image_url,
					updatedAt: new Date(),
				},
			});
	}

	if (event.type === "user.deleted" && event.data.id) {
		await db.delete(users).where(eq(users.clerkId, event.data.id));
	}

	return Response.json({ received: true });
}
