"use client";

import { UserButton } from "@clerk/nextjs";
import {
	BarChart3,
	CalendarDays,
	CheckSquare2,
	FolderKanban,
	LayoutDashboard,
	Menu,
	PanelLeftClose,
	PanelLeftOpen,
	Settings,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { FloworaLogo } from "@/components/flowora-logo";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";
import { PageTransition } from "@/components/page-transition";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { NotificationItem, UserSummary, WorkspaceSummary } from "@/types";

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
	notifications,
}: {
	children: ReactNode;
	user: UserSummary;
	workspace: WorkspaceSummary | null;
	notifications: {
		items: NotificationItem[];
		unreadCount: number;
		totalCount: number;
	};
}) {
	const pathname = usePathname();
	const sidebarOpen = useUIStore((state) => state.isSidebarOpen);
	const sidebarCollapsed = useUIStore((state) => state.isSidebarCollapsed);
	const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
	const toggleSidebarCollapsed = useUIStore(
		(state) => state.toggleSidebarCollapsed,
	);

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
					sidebarCollapsed && "lg:justify-center lg:px-0",
					active
						? "bg-blue_munsell-50 text-blue_munsell-700 dark:bg-blue_munsell-900/35 dark:text-blue_munsell-200"
						: "text-paynes_gray-500 hover:bg-platinum-100 hover:text-outer_space-900 dark:text-french_gray-400 dark:hover:bg-outer_space-400 dark:hover:text-platinum-50",
				)}
				title={sidebarCollapsed ? item.label : undefined}
				aria-label={sidebarCollapsed ? item.label : undefined}
			>
				<item.icon size={17} className="shrink-0" />
				<span className={cn(sidebarCollapsed && "lg:hidden")}>
					{item.label}
				</span>
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
					"fixed inset-y-0 left-1.5 z-50 flex w-70 flex-col border-r border-french_gray-300/80 bg-white px-3 transition-[width,transform] duration-200 dark:border-paynes_gray-800 dark:bg-outer_space-500 lg:translate-x-0",
					sidebarCollapsed && "lg:w-20 lg:px-2",
					sidebarOpen ? "translate-x-0" : "-translate-x-[calc(100%+8px)]",
				)}
			>
				<div
					className={cn(
						"flex h-18 items-center justify-between px-2",
						sidebarCollapsed && "lg:justify-center lg:px-0",
					)}
				>
					{sidebarCollapsed ? (
						<>
							<div className="lg:hidden">
								<FloworaLogo href="/dashboard" />
							</div>
							<div className="hidden lg:block">
								<FloworaLogo href="/dashboard" compact />
							</div>
						</>
					) : (
						<FloworaLogo href="/dashboard" />
					)}
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
				<Button
					variant="secondary"
					size="icon"
					className="absolute -right-4 top-5 z-10 hidden size-8 rounded-full bg-white shadow-md lg:inline-flex dark:bg-outer_space-400"
					onClick={toggleSidebarCollapsed}
					aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					{sidebarCollapsed ? (
						<PanelLeftOpen size={15} />
					) : (
						<PanelLeftClose size={15} />
					)}
				</Button>

				<div className={cn("px-1 pb-4", sidebarCollapsed && "lg:hidden")}>
					<WorkspaceSwitcher activeWorkspaceId={workspace?.id ?? null} />
				</div>

				<nav className="flex-1 space-y-1 overflow-y-auto px-1 scrollbar-thin">
					<p
						className={cn(
							"px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-paynes_gray-400",
							sidebarCollapsed && "lg:sr-only",
						)}
					>
						Workspace
					</p>
					{primaryNavigation.map(navLink)}
					<NotificationCenter
						items={notifications.items}
						unreadCount={notifications.unreadCount}
						variant="sidebar"
						collapsed={sidebarCollapsed}
					/>
					<p
						className={cn(
							"px-3 pb-1 pt-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-paynes_gray-400",
							sidebarCollapsed && "lg:sr-only",
						)}
					>
						Manage
					</p>
					{secondaryNavigation.map(navLink)}
				</nav>

				<div className="space-y-2 border-t border-french_gray-200 px-1 py-3 dark:border-paynes_gray-800">
					<div
						className={cn(
							"relative flex items-center gap-2 rounded-xl p-2 transition hover:bg-platinum-100 focus-within:ring-2 focus-within:ring-blue_munsell-400 dark:hover:bg-outer_space-400",
							sidebarCollapsed && "lg:justify-center lg:p-1.5",
						)}
					>
						<div
							className={cn(
								"flex min-w-0 flex-1 items-center gap-3",
								sidebarCollapsed && "lg:flex-none",
							)}
						>
							<Avatar
								name={user.name}
								src={user.avatarUrl}
								className="size-9"
							/>
							<div
								className={cn(
									"min-w-0 flex-1",
									sidebarCollapsed && "lg:hidden",
								)}
							>
								<p className="truncate text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
									{user.name}
								</p>
								<p className="truncate text-[11px] text-paynes_gray-500">
									{user.email}
								</p>
							</div>
						</div>
						<UserButton
							appearance={{
								elements: {
									rootBox: "absolute inset-0 z-10 size-full",
									userButtonTrigger: "size-full rounded-xl opacity-0",
									avatarBox: "size-full",
								},
							}}
						/>
					</div>
					<div className="px-1">
						{sidebarCollapsed ? (
							<>
								<div className="lg:hidden">
									<ThemeToggle />
								</div>
								<div className="hidden lg:flex lg:justify-center">
									<ThemeToggle compact />
								</div>
							</>
						) : (
							<ThemeToggle />
						)}
					</div>
				</div>
			</aside>

			<div
				className={cn(
					"transition-[padding] duration-200 lg:pl-72",
					sidebarCollapsed && "lg:pl-[5.25rem]",
				)}
			>
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
					<NotificationCenter
						items={notifications.items}
						unreadCount={notifications.unreadCount}
						variant="icon"
					/>
				</header>
				<main className="mx-auto max-w-[1680px] p-4 sm:p-6 lg:p-8 xl:p-10">
					<PageTransition>{children}</PageTransition>
				</main>
			</div>
			<CreateProjectModal />
		</div>
	);
}
