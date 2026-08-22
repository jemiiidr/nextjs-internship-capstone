"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getWorkspaceContext } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import type { ActionResult } from "@/types";

export async function markNotificationReadAction(
	notificationId: string,
): Promise<ActionResult> {
	const context = await getWorkspaceContext();
	if (!/^[0-9a-f-]{36}$/i.test(notificationId)) {
		return { success: false, message: "Invalid notification." };
	}
	await db
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.id, notificationId),
				eq(notifications.recipientId, context.user.id),
				context.workspaceId
					? eq(notifications.workspaceId, context.workspaceId)
					: undefined,
			),
		);
	revalidatePath("/", "layout");
	return { success: true, message: "Notification marked as read." };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
	const context = await getWorkspaceContext();
	await db
		.update(notifications)
		.set({ readAt: new Date() })
		.where(
			and(
				eq(notifications.recipientId, context.user.id),
				isNull(notifications.readAt),
				context.workspaceId
					? eq(notifications.workspaceId, context.workspaceId)
					: undefined,
			),
		);
	revalidatePath("/", "layout");
	return { success: true, message: "All notifications marked as read." };
}
