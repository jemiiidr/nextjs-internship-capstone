import { Search } from "lucide-react"
import type { Metadata } from "next"
import { CreateProjectButton } from "@/components/create-project-button"
import { ProjectGrid } from "@/components/project-grid"
import { Input } from "@/components/ui/input"
import { requireDbUser } from "@/lib/auth"
import { getProjectsForUser } from "@/lib/db"

export const metadata: Metadata = { title: "Projects" }

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	const user = await requireDbUser()
	const { q = "" } = await searchParams
	const projects = await getProjectsForUser(user.id, q)
	return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-outer_space-900 dark:text-platinum-50">Projects</h1><p className="mt-2 text-paynes_gray-500 dark:text-french_gray-400">Browse private projects, memberships, and workspace-visible boards.</p></div><CreateProjectButton /></header><form className="relative max-w-xl"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-paynes_gray-500" size={17} /><Input name="q" defaultValue={q} placeholder="Search project names…" className="pl-10" /><button type="submit" className="sr-only">Search</button></form><ProjectGrid projects={projects} /></div>
}
