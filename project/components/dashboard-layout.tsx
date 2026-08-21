"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	Bell,
	CalendarDays,
	CheckSquare2,
	CircleHelp,
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
import { FloworaLogo } from "@/components/flowora-logo";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { UserSummary, WorkspaceSummary } from "@/types";

const primaryNavigation = [
	{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/my-tasks", label: "My Tasks", icon: CheckSquare2 },
	{ href: "/projects", label: "Projects", icon: FolderKanban },
	{ href: "/calendar", label: "Calendar", icon: CalendarDays },
	{ href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const secondaryNavigation = [
	{ href: "/team", label: "Team", icon: Users },
	{ href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardLayout({
	children,
	user,
	workspace,
	workspaceMembers,
}: {
	children: ReactNode;
	user: UserSummary;
	workspace: WorkspaceSummary | null;
	workspaceMembers: UserSummary[];
}) {
	const pathname = usePathname();
	const sidebarOpen = useUIStore((state) => state.isSidebarOpen);
	const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);

	const navLink = (item: (typeof primaryNavigation)[number]) => {
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
					"flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
					active
						? "bg-blue_munsell-50 text-blue_munsell-700 dark:bg-blue_munsell-900/35 dark:text-blue_munsell-200"
						: "text-paynes_gray-500 hover:bg-platinum-100 hover:text-outer_space-900 dark:text-french_gray-400 dark:hover:bg-outer_space-400 dark:hover:text-platinum-50",
				)}
			>
				<item.icon size={17} />
				{item.label}
			</Link>
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<div className="flowora-rainbow-line fixed inset-y-0 left-0 z-60 w-1.5" />
			{sidebarOpen ? (
				<button
					type="button"
					aria-label="Close navigation"
					className="fixed inset-0 z-40 bg-outer_space-900/45 backdrop-blur-[1px] lg:hidden"
					onClick={() => setSidebarOpen(false)}
				/>
			) : null}

			<aside
				className={cn(
					"fixed inset-y-0 left-1.5 z-50 flex w-70 flex-col border-r border-french_gray-300/80 bg-white px-3 transition-transform dark:border-paynes_gray-800 dark:bg-outer_space-500 lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+8px)]",
				)}
			>
				<div className="flex h-18 items-center justify-between px-2">
					<FloworaLogo href="/dashboard" />
					<Button
						variant="ghost"
						size="icon"
						className="lg:hidden"
						onClick={() => setSidebarOpen(false)}
						aria-label="Close menu"
					>
						<X size={18} />
					</Button>
				</div>

				<div className="px-1 pb-4">
					<WorkspaceSwitcher activeWorkspaceId={workspace?.id ?? null} />
					{workspace ? (
						<div className="mt-2 flex items-center justify-between px-2 text-xs text-paynes_gray-500">
							<span className="capitalize">
								{workspace.role} · {workspace.memberCount} members
							</span>
							<AvatarStack
								users={workspaceMembers}
								total={workspace.memberCount}
								limit={3}
							/>
						</div>
					) : null}
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto px-1 scrollbar-thin">
					<p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-paynes_gray-400">
						Workspace
					</p>
					{primaryNavigation.map(navLink)}
					<p className="px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-paynes_gray-400">
						Manage
					</p>
					{secondaryNavigation.map(navLink)}
				</nav>

				<div className="space-y-2 border-t border-french_gray-200 px-1 py-3 dark:border-paynes_gray-800">
					<div className="flex items-center gap-2 rounded-xl p-2">
						<Link
							href="/settings"
							className="flex min-w-0 flex-1 items-center gap-3 rounded-lg transition hover:opacity-80"
						>
							<Avatar
								name={user.name}
								src={user.avatarUrl}
								className="size-9"
							/>
							<div className="min-w-0 flex-1">
								<p className="truncate text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
									{user.name}
								</p>
								<p className="truncate text-[11px] text-paynes_gray-500">
									{user.email}
								</p>
							</div>
						</Link>
						<UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
					</div>
					<div className="flex items-center justify-between px-2">
						<span className="flex items-center gap-2 text-xs text-paynes_gray-500">
							<CircleHelp size={14} /> Help & support
						</span>
						<ThemeToggle />
					</div>
				</div>
			</aside>

			<div className="lg:pl-72">
				<header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-french_gray-300/80 bg-white/90 px-4 backdrop-blur-lg lg:hidden dark:border-paynes_gray-800 dark:bg-outer_space-500/90">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setSidebarOpen(true)}
						aria-label="Open menu"
					>
						<Menu size={20} />
					</Button>
					<FloworaLogo href="/dashboard" compact />
					<Button variant="ghost" size="icon" aria-label="Notifications">
						<Bell size={18} />
					</Button>
				</header>
				<main className="mx-auto max-w-[1680px] p-4 sm:p-6 lg:p-8 xl:p-10">
					{children}
				</main>
			</div>
			<CreateProjectModal />
		</div>
	);
}
