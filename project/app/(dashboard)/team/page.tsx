import { Users } from "lucide-react"
import type { Metadata } from "next"
import { Avatar } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import { requireDbUser } from "@/lib/auth"
import { getWorkspaceUsers } from "@/lib/db"

export const metadata: Metadata = { title: "Team" }
export default async function TeamPage() {
	await requireDbUser()
	const users = await getWorkspaceUsers()
	return <div className="space-y-7"><header><h1 className="text-3xl font-bold text-outer_space-900 dark:text-platinum-50">Workspace team</h1><p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">Users appear after their Clerk account has been synchronized. Add them to individual projects from a project board.</p></header>{users.length === 0 ? <EmptyState icon={<Users size={22} />} title="No synchronized users" description="Ask a teammate to sign in once, or configure the Clerk webhook for automatic synchronization." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{users.map((user) => <Card key={user.id}><CardContent className="flex items-center gap-3 p-5"><Avatar name={user.name} src={user.avatarUrl} className="size-10" /><div className="min-w-0"><p className="truncate font-medium text-outer_space-500 dark:text-platinum-500">{user.name}</p><p className="truncate text-sm text-paynes_gray-500 dark:text-french_gray-400">{user.email}</p></div></CardContent></Card>)}</div>}</div>
}
