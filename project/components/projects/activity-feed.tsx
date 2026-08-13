import { Activity } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { formatRelativeDate } from "@/lib/utils"
import type { ActivityItem } from "@/types"

const actionText: Record<ActivityItem["action"], string> = {
	project_created: "created the project",
	project_updated: "updated the project",
	project_member_added: "added a project member",
	project_member_removed: "removed a project member",
	list_created: "created a list",
	list_updated: "renamed a list",
	list_deleted: "deleted a list",
	task_created: "created a task",
	task_updated: "updated a task",
	task_moved: "moved a task",
	task_deleted: "deleted a task",
	comment_created: "commented on a task",
}

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
	return (
		<section className="rounded-xl border border-french_gray-300 bg-white p-4 dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<h2 className="flex items-center gap-2 font-semibold text-outer_space-500 dark:text-platinum-500"><Activity size={17} /> Recent activity</h2>
			<div className="mt-3 space-y-3">{activities.length === 0 ? <p className="text-sm text-paynes_gray-500">No activity yet.</p> : activities.slice(0, 10).map((item) => <div key={item.id} className="flex gap-2"><Avatar name={item.actor.name} src={item.actor.avatarUrl} className="size-7" /><div><p className="text-sm text-paynes_gray-500 dark:text-french_gray-400"><strong className="text-outer_space-500 dark:text-platinum-500">{item.actor.name}</strong> {actionText[item.action]}</p><p className="text-xs text-paynes_gray-500">{formatRelativeDate(item.createdAt)}</p></div></div>)}</div>
		</section>
	)
}
