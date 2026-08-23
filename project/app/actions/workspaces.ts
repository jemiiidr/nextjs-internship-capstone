"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireWorkspaceContext } from "@/lib/auth";
import type { ActionResult } from "@/types";

const workspaceSchema = z.object({ name: z.string().trim().min(2).max(100) });

export async function updateWorkspaceAction(
	_previous: ActionResult,
	formData: FormData,
): Promise<ActionResult> {
	const context = await requireWorkspaceContext();
	if (context.role !== "admin")
		return {
			success: false,
			message: "Only workspace admins can change workspace settings.",
		};
	const requestedWorkspaceId = String(formData.get("workspaceId") ?? "");
	if (requestedWorkspaceId !== context.workspaceId)
		return {
			success: false,
			message: "Activate this workspace before changing its settings.",
		};
	const parsed = workspaceSchema.safeParse({ name: formData.get("name") });
	if (!parsed.success)
		return {
			success: false,
			message: "Workspace name must contain 2 to 100 characters.",
			fieldErrors: parsed.error.flatten().fieldErrors,
		};
	try {
		const client = await clerkClient();
		await client.organizations.updateOrganization(context.workspaceId, {
			name: parsed.data.name,
		});
		revalidatePath("/", "layout");
		return { success: true, message: "Workspace updated." };
	} catch (error) {
		console.error("Unable to update Clerk workspace", error);
		return {
			success: false,
			message: "Unable to update the workspace. Please try again.",
		};
	}
}
