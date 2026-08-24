import type { Metadata } from "next";
import { MyTasksView } from "@/components/my-tasks/my-tasks-view";
import { requireWorkspaceContext } from "@/lib/auth";
import { getMyTasks } from "@/lib/db";

export const metadata: Metadata = { title: "My Tasks" };

export default async function MyTasksPage() {
	const context = await requireWorkspaceContext();
	const tasks = await getMyTasks({
		userId: context.user.id,
		workspaceId: context.workspaceId,
		role: context.role,
	});
	return <MyTasksView tasks={tasks} user={context.user} />;
}
