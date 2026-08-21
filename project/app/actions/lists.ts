"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { canEditProject, requireProjectAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { activities, lists } from "@/lib/db/schema";
import { listSchema, listUpdateSchema } from "@/lib/validations";
import type { ActionResult, BoardList } from "@/types";

export async function createListAction(
	formData: FormData,
): Promise<ActionResult<BoardList>> {
	const parsed = listSchema.safeParse({
		projectId: formData.get("projectId"),
		name: formData.get("name"),
	});
	if (!parsed.success)
		return { success: false, message: "List name is required." };

	const access = await requireProjectAccess(parsed.data.projectId);
	if (!access || !canEditProject(access.role)) {
		return {
			success: false,
			message: "You do not have permission to add lists.",
		};
	}

	const existing = await db
		.select({ position: lists.position })
		.from(lists)
		.where(eq(lists.projectId, parsed.data.projectId))
		.orderBy(asc(lists.position));
	const position = existing.length
		? Math.max(...existing.map((list) => list.position)) + 1
		: 0;

	const [list] = await db
		.insert(lists)
		.values({ ...parsed.data, position })
		.returning();
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: access.user.id,
		action: "list_created",
		metadata: { listName: list.name },
	});

	revalidatePath(`/projects/${parsed.data.projectId}`);
	return {
		success: true,
		message: "List created.",
		data: {
			id: list.id,
			projectId: list.projectId,
			name: list.name,
			position: list.position,
		},
	};
}

export async function updateListAction(
	formData: FormData,
): Promise<ActionResult> {
	const parsed = listUpdateSchema.safeParse({
		projectId: formData.get("projectId"),
		listId: formData.get("listId"),
		name: formData.get("name"),
	});
	if (!parsed.success)
		return { success: false, message: "Invalid list details." };

	const access = await requireProjectAccess(parsed.data.projectId);
	if (!access || !canEditProject(access.role)) {
		return {
			success: false,
			message: "You do not have permission to rename lists.",
		};
	}

	await db
		.update(lists)
		.set({ name: parsed.data.name, updatedAt: new Date() })
		.where(
			and(
				eq(lists.id, parsed.data.listId),
				eq(lists.projectId, parsed.data.projectId),
			),
		);
	await db.insert(activities).values({
		projectId: parsed.data.projectId,
		actorId: access.user.id,
		action: "list_updated",
		metadata: { listName: parsed.data.name },
	});
	revalidatePath(`/projects/${parsed.data.projectId}`);
	return { success: true, message: "List renamed." };
}

export async function deleteListAction(
	projectId: string,
	listId: string,
): Promise<ActionResult> {
	const access = await requireProjectAccess(projectId);
	if (!access || !canEditProject(access.role)) {
		return {
			success: false,
			message: "You do not have permission to delete lists.",
		};
	}

	const list = await db.query.lists.findFirst({
		where: and(eq(lists.id, listId), eq(lists.projectId, projectId)),
	});
	if (!list) return { success: false, message: "List not found." };

	await db.delete(lists).where(eq(lists.id, listId));
	await db.insert(activities).values({
		projectId,
		actorId: access.user.id,
		action: "list_deleted",
		metadata: { listName: list.name },
	});
	revalidatePath(`/projects/${projectId}`);
	return { success: true, message: "List and its tasks were deleted." };
}
