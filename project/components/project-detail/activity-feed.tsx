"use client";

import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatRelativeDate } from "@/lib/utils";
import type { ActivityItem } from "@/types";

const actionText: Record<ActivityItem["action"], string> = { project_created: "created the project", project_updated: "updated the project", project_member_added: "added a project member", project_member_removed: "removed a project member", list_created: "created a list", list_updated: "renamed a list", list_deleted: "deleted a list", task_created: "created a task", task_updated: "updated a task", task_moved: "moved a task", task_deleted: "deleted a task", comment_created: "commented on a task" };
const pageSize = 6;

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
	const [open, setOpen] = useState(false);
	const [page, setPage] = useState(1);
	const pageCount = Math.max(1, Math.ceil(activities.length / pageSize));
	const row = (item: ActivityItem) => <div key={item.id} className="flex gap-3 py-3"><Avatar name={item.actor.name} src={item.actor.avatarUrl} className="size-8"/><div className="min-w-0 flex-1"><p className="text-sm text-paynes_gray-500 dark:text-french_gray-400"><strong className="text-outer_space-900 dark:text-platinum-50">{item.actor.name}</strong> {actionText[item.action]}</p><p className="mt-0.5 text-xs text-paynes_gray-500">{formatRelativeDate(item.createdAt)}</p></div><Activity size={14} className="mt-1 text-blue_munsell-500"/></div>;
	return <><section className="min-h-[20rem] rounded-2xl border border-french_gray-300 bg-white p-5 dark:border-paynes_gray-800 dark:bg-outer_space-500"><div className="flex items-center justify-between"><h2 className="font-semibold text-outer_space-900 dark:text-platinum-50">Recent Activity</h2><button type="button" onClick={() => { setPage(1); setOpen(true); }} className="text-xs font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">View all</button></div><div className="mt-4 divide-y divide-french_gray-200 dark:divide-paynes_gray-800">{activities.length ? activities.slice(0, 5).map(row) : <p className="py-12 text-center text-sm text-paynes_gray-500">No recent activity records.</p>}</div></section>
	<Modal open={open} onClose={() => setOpen(false)} title="Project activity" description="A chronological history of changes to this project." className="max-w-2xl"><div className="min-h-96"><div className="divide-y divide-french_gray-200 dark:divide-paynes_gray-800">{activities.slice((page - 1) * pageSize, page * pageSize).map(row)}</div>{!activities.length ? <p className="py-16 text-center text-sm text-paynes_gray-500">No activity records yet.</p> : null}</div><div className="mt-4 flex items-center justify-between border-t border-french_gray-200 pt-4 dark:border-paynes_gray-800"><span className="text-xs text-paynes_gray-500">Page {page} of {pageCount}</span><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}><ChevronLeft size={14}/> Previous</Button><Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.min(pageCount, value + 1))} disabled={page === pageCount}>Next <ChevronRight size={14}/></Button></div></div></Modal></>;
}
