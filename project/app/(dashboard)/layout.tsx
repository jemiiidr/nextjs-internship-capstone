import type { ReactNode } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { requireDbUser } from "@/lib/auth"

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
	const user = await requireDbUser()
	return <DashboardLayout user={{ name: user.name, email: user.email, avatarUrl: user.avatarUrl }}>{children}</DashboardLayout>
}
