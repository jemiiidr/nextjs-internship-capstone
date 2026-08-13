import { ArrowLeft, CalendarDays, Lock } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { KanbanBoard } from "@/components/kanban-board"
import { ActivityFeed } from "@/components/projects/activity-feed"
import { ProjectMembers } from "@/components/projects/project-members"
import { Badge } from "@/components/ui/badge"
import { requireDbUser } from "@/lib/auth"
import { getProjectBoard, getWorkspaceUsers } from "@/lib/db"
import { formatDate } from "@/lib/utils"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params
	return { title: `Project ${id.slice(0, 8)}` }
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const user = await requireDbUser()
	const [board, workspaceUsers] = await Promise.all([getProjectBoard(id, user.id), getWorkspaceUsers()])
	if (!board) notFound()
	return <div className="space-y-6"><header><Link href="/projects" className="inline-flex items-center gap-1 text-sm text-paynes_gray-500 hover:text-blue_munsell-500 dark:text-french_gray-400"><ArrowLeft size={15} /> All projects</Link><div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h1 className="text-3xl font-bold text-outer_space-900 dark:text-platinum-50">{board.project.name}</h1><Badge className="capitalize">{board.project.role}</Badge>{board.project.visibility === "private" ? <Badge><Lock size={11} /> Private</Badge> : <Badge>Workspace</Badge>}</div><p className="mt-2 max-w-3xl text-paynes_gray-500 dark:text-french_gray-400">{board.project.description || "No project description."}</p></div><p className="flex items-center gap-2 text-sm text-paynes_gray-500 dark:text-french_gray-400"><CalendarDays size={16} /> {formatDate(board.project.dueDate)}</p></div></header><div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_20rem]"><KanbanBoard data={board} /><aside className="space-y-4"><ProjectMembers projectId={board.project.id} role={board.project.role} members={board.members} workspaceUsers={workspaceUsers} /><ActivityFeed activities={board.activities} /></aside></div></div>
}
