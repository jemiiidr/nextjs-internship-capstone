"use client"

import { UserPlus, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { addProjectMemberAction, removeProjectMemberAction } from "@/app/actions/projects"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MemberRole, ProjectMember, UserSummary } from "@/types"

export function ProjectMembers({ projectId, role, members, workspaceUsers }: { projectId: string; role: MemberRole; members: ProjectMember[]; workspaceUsers: UserSummary[] }) {
	const router = useRouter()
	const [message, setMessage] = useState("")
	const [isPending, startTransition] = useTransition()
	const canManage = role === "owner" || role === "admin"
	const memberIds = new Set(members.map((member) => member.user.id))
	const availableUsers = workspaceUsers.filter((user) => !memberIds.has(user.id))

	const addMember = (formData: FormData) => {
		startTransition(async () => { const result = await addProjectMemberAction(formData); setMessage(result.message); if (result.success) router.refresh() })
	}
	const removeMember = (userId: string) => {
		startTransition(async () => { const result = await removeProjectMemberAction(projectId, userId); setMessage(result.message); if (result.success) router.refresh() })
	}

	return (
		<section className="rounded-xl border border-french_gray-300 bg-white p-4 dark:border-paynes_gray-400 dark:bg-outer_space-500">
			<h2 className="font-semibold text-outer_space-500 dark:text-platinum-500">Project members</h2>
			<div className="mt-3 space-y-3">{members.map((member) => <div key={member.user.id} className="flex items-center gap-2"><Avatar name={member.user.name} src={member.user.avatarUrl} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-outer_space-500 dark:text-platinum-500">{member.user.name}</p><p className="truncate text-xs text-paynes_gray-500">{member.user.email}</p></div><Badge className="capitalize">{member.role}</Badge>{canManage && member.role !== "owner" ? <Button size="icon" variant="ghost" className="size-8" disabled={isPending} onClick={() => removeMember(member.user.id)} aria-label={`Remove ${member.user.name}`}><X size={14} /></Button> : null}</div>)}</div>
			{canManage && availableUsers.length > 0 ? <form action={addMember} className="mt-4 space-y-2 border-t border-french_gray-300 pt-4 dark:border-paynes_gray-400"><input type="hidden" name="projectId" value={projectId} /><select name="userId" required defaultValue="" className="h-9 w-full rounded-lg border border-french_gray-300 bg-white px-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"><option value="" disabled>Select a user</option>{availableUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select><div className="flex gap-2"><select name="role" defaultValue="member" className="h-9 min-w-0 flex-1 rounded-lg border border-french_gray-300 bg-white px-2 text-sm dark:border-paynes_gray-400 dark:bg-outer_space-400"><option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></select><Button type="submit" size="sm" disabled={isPending}><UserPlus size={14} /> Add</Button></div></form> : null}
			{message ? <p className="mt-3 text-xs text-paynes_gray-500">{message}</p> : null}
		</section>
	)
}
