"use client";

import { UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addProjectMemberAction, removeProjectMemberAction, updateProjectMemberLabelAction } from "@/app/actions/projects";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { hasPermission } from "@/lib/rbac";
import type { MemberRole, ProjectMember, UserSummary } from "@/types";

const roleSuggestions = ["Product Manager", "Developer", "Designer", "QA Engineer", "Researcher", "Data Analyst", "Stakeholder", "Contributor"];

export function ProjectMembers({ projectId, role, members, workspaceUsers, variant = "panel" }: { projectId: string; role: MemberRole; members: ProjectMember[]; workspaceUsers: UserSummary[]; variant?: "panel" | "manager" }) {
	const router = useRouter();
	const [message, setMessage] = useState("");
	const [viewAllOpen, setViewAllOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const canManage = hasPermission(role, "project:manage-members");
	const memberIds = new Set(members.map((member) => member.user.id));
	const availableUsers = workspaceUsers.filter((user) => !memberIds.has(user.id));
	const run = (action: () => Promise<{ success: boolean; message: string }>) => startTransition(async () => { const result = await action(); setMessage(result.message); if (result.success) router.refresh(); });
	const memberRow = (member: ProjectMember, editable = false) => <div key={member.user.id} className="flex items-center gap-3 rounded-xl py-2">
		<Avatar name={member.user.name} src={member.user.avatarUrl} className="size-9"/>
		<div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-outer_space-900 dark:text-platinum-50">{member.user.name}</p><p className="truncate text-xs text-paynes_gray-500">{member.roleLabel ?? (member.role === "owner" ? "Owner" : "Contributor")}</p></div>
		{editable && canManage ? <form action={(formData) => run(() => updateProjectMemberLabelAction(formData))} className="flex w-48 items-center gap-1"><input type="hidden" name="projectId" value={projectId}/><input type="hidden" name="userId" value={member.user.id}/><Combobox name="roleLabel" defaultValue={member.roleLabel ?? (member.role === "owner" ? "Owner" : "Contributor")} options={roleSuggestions} className="min-w-0 flex-1"/><Button type="submit" size="sm" disabled={isPending}>Save</Button></form> : <Badge>{member.roleLabel ?? (member.role === "owner" ? "Owner" : "Contributor")}</Badge>}
		{editable && canManage && member.role !== "owner" ? <Button size="icon" variant="ghost" className="size-8" disabled={isPending} onClick={() => run(() => removeProjectMemberAction(projectId, member.user.id))} aria-label={`Remove ${member.user.name}`}><X size={14}/></Button> : null}
	</div>;

	if (variant === "manager") return <div className="space-y-4">
		<div className="max-h-72 divide-y divide-french_gray-200 overflow-y-auto pr-1 scrollbar-thin dark:divide-paynes_gray-800">{members.map((member) => memberRow(member, true))}</div>
		{canManage && availableUsers.length ? <form action={(formData) => run(() => addProjectMemberAction(formData))} className="grid gap-2 border-t border-french_gray-200 pt-4 sm:grid-cols-[1fr_1fr_auto] dark:border-paynes_gray-800"><input type="hidden" name="projectId" value={projectId}/><Select name="userId" required defaultValue="" options={[{ value: "", label: "Select a workspace member", disabled: true }, ...availableUsers.map((user) => ({ value: user.id, label: user.name }))]}/><Combobox name="roleLabel" defaultValue="Contributor" options={roleSuggestions}/><Button type="submit" disabled={isPending}><UserPlus size={15}/> Add</Button></form> : null}
		{message ? <p className="text-xs text-paynes_gray-500">{message}</p> : null}
	</div>;

	return <><section className="min-h-[20rem] rounded-2xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-800 dark:bg-outer_space-500"><div className="flex items-center justify-between"><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Project Members</h2><button type="button" onClick={() => setViewAllOpen(true)} className="text-xs font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">View all</button></div><div className="mt-4 divide-y divide-french_gray-200 dark:divide-paynes_gray-800">{members.length ? members.slice(0, 5).map((member) => memberRow(member)) : <p className="py-12 text-center text-sm text-paynes_gray-500">No project members yet.</p>}</div></section>
	<Modal open={viewAllOpen} onClose={() => setViewAllOpen(false)} title="Project members" description={`${members.length} member${members.length === 1 ? "" : "s"} assigned to this project.`} className="max-w-2xl"><div className="max-h-[60vh] divide-y divide-french_gray-200 overflow-y-auto pr-2 scrollbar-thin dark:divide-paynes_gray-800">{members.map((member) => memberRow(member))}</div></Modal></>;
}
