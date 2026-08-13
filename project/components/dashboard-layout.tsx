"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	CalendarDays,
	FolderKanban,
	LayoutDashboard,
	Menu,
	Settings,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const navigation = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/projects", label: "Projects", icon: FolderKanban },
	{ href: "/calendar", label: "Calendar", icon: CalendarDays },
	{ href: "/analytics", label: "Analytics", icon: BarChart3 },
	{ href: "/team", label: "Team", icon: Users },
	{ href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({
	children,
	user,
}: {
	children: ReactNode;
	user: { name: string; email: string; avatarUrl: string | null };
}) {
	const pathname = usePathname();
	const sidebarOpen = useUIStore((state) => state.isSidebarOpen);
	const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

	return (
		<div className="min-h-screen bg-background">
			{sidebarOpen ? (
				<button
					type="button"
					aria-label="Close navigation"
					className="fixed inset-0 z-40 bg-outer_space-900/60 lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			) : null}
			<aside
				className={cn(
					"fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-french_gray-300 bg-white transition-transform dark:border-paynes_gray-400 dark:bg-outer_space-500 lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex h-16 items-center justify-between border-b border-french_gray-300 px-5 dark:border-paynes_gray-400">
					<Link
						href="/dashboard"
						className="flex items-center gap-2 text-lg font-bold text-outer_space-500 dark:text-platinum-500"
					>
						<span className="grid size-9 place-items-center rounded-xl bg-blue_munsell-500 text-white">
							P
						</span>
						ProjectFlow
					</Link>
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setSidebarOpen(false)}
						aria-label="Close menu"
					>
						<X size={19} />
					</Button>
				</div>
				<nav className="flex-1 space-y-1 p-4">
					{navigation.map((item) => {
						const active =
							item.href === "/dashboard"
								? pathname === item.href
								: pathname.startsWith(item.href);
						return (
							<Link
								key={item.href}
								href={item.href}
								onClick={() => setSidebarOpen(false)}
								className={cn(
									"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
									active
										? "bg-blue_munsell-50 text-blue_munsell-700 dark:bg-blue_munsell-900/40 dark:text-blue_munsell-200"
										: "text-paynes_gray-500 hover:bg-platinum-100 hover:text-outer_space-500 dark:text-french_gray-400 dark:hover:bg-outer_space-400 dark:hover:text-platinum-500",
								)}
							>
								<item.icon size={18} />
								{item.label}
							</Link>
						);
					})}
				</nav>
				<div className="border-t border-french_gray-300 p-4 dark:border-paynes_gray-400">
					<div className="flex items-center gap-3">
						<Avatar name={user.name} src={user.avatarUrl} />
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-outer_space-500 dark:text-platinum-500">
								{user.name}
							</p>
							<p className="truncate text-xs text-paynes_gray-500 dark:text-french_gray-400">
								{user.email}
							</p>
						</div>
						<UserButton />
					</div>
				</div>
			</aside>
			<div className="lg:pl-72">
				<header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-french_gray-300 bg-white/90 px-4 backdrop-blur dark:border-paynes_gray-400 dark:bg-outer_space-500/90 sm:px-6">
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setSidebarOpen(true)}
						aria-label="Open menu"
					>
						<Menu size={20} />
					</Button>
					<div className="ml-auto flex items-center gap-2">
						<ThemeToggle />
						<UserButton />
					</div>
				</header>
				<main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
					{children}
				</main>
			</div>
			<CreateProjectModal />
		</div>
	);
}
