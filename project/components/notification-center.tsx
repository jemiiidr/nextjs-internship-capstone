"use client";

import {
	Bell,
	CalendarClock,
	CheckCheck,
	CircleAlert,
	UserPlus,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "@/app/actions/notifications";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { NotificationItem } from "@/types";

function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
	const className =
		"mt-0.5 shrink-0 text-blue_munsell-600 dark:text-blue_munsell-300";
	if (type === "deadline_today")
		return <CalendarClock className={className} size={18} />;
	if (type === "task_overdue")
		return <CircleAlert className="mt-0.5 shrink-0 text-red-500" size={18} />;
	if (type === "member_joined")
		return <Users className={className} size={18} />;
	return <UserPlus className={className} size={18} />;
}

function UnreadBadge({ count }: { count: number }) {
	if (count === 0) return null;
	return (
		<span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold leading-4 text-white dark:border-outer_space-500">
			{count > 99 ? "99+" : count}
		</span>
	);
}

export function NotificationCenter({
	unreadCount,
	variant,
	collapsed = false,
}: {
	items: NotificationItem[];
	unreadCount: number;
	variant: "sidebar" | "icon";
	collapsed?: boolean;
}) {
	if (variant === "icon")
		return (
			<Link
				href="/notifications"
				className="relative inline-flex size-10 items-center justify-center rounded-xl text-paynes_gray-500 transition hover:bg-platinum-200 hover:text-outer_space-500 dark:text-french_gray-400 dark:hover:bg-outer_space-400 dark:hover:text-platinum-500"
				aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
			>
				<Bell size={18} />
				<UnreadBadge count={unreadCount} />
			</Link>
		);

	return (
		<Link
			href="/notifications"
			className={cn(
				"relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-paynes_gray-500 transition hover:bg-platinum-100 hover:text-outer_space-900 dark:text-french_gray-400 dark:hover:bg-outer_space-400 dark:hover:text-platinum-50",
				collapsed && "lg:justify-center lg:px-0",
			)}
			title={collapsed ? "Notifications" : undefined}
			aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
		>
			<span className="relative shrink-0">
				<Bell size={17} />
				<UnreadBadge count={unreadCount} />
			</span>
			<span className={cn(collapsed && "lg:hidden")}>Notifications</span>
			{unreadCount > 0 ? (
				<span
					className={cn(
						"ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white",
						collapsed && "lg:hidden",
					)}
				>
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			) : null}
		</Link>
	);
}

export function NotificationInbox({
	items,
	unreadCount,
	page = 1,
	pageCount = 1,
}: {
	items: NotificationItem[];
	unreadCount: number;
	page?: number;
	pageCount?: number;
}) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();

	const openNotification = (notification: NotificationItem) => {
		startTransition(async () => {
			if (!notification.read) await markNotificationReadAction(notification.id);
			router.push(notification.href);
			router.refresh();
		});
	};

	return (
		<div className="space-y-4">
			<div className="flex min-h-10 items-center justify-between gap-3">
				<p className="text-sm text-paynes_gray-500">
					{unreadCount
						? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
						: "You’re all caught up."}
				</p>
				{unreadCount > 0 ? (
					<Button
						variant="secondary"
						size="sm"
						disabled={pending}
						onClick={() =>
							startTransition(async () => {
								await markAllNotificationsReadAction();
								router.refresh();
							})
						}
					>
						<CheckCheck size={15} /> Mark all as read
					</Button>
				) : null}
			</div>
			{items.length > 0 ? (
				<div className="space-y-4">
					<div className="space-y-2">
						{items.map((notification) => (
							<Link
								key={notification.id}
								href={notification.href}
								onClick={(event) => {
									event.preventDefault();
									openNotification(notification);
								}}
								className={cn(
									"flex gap-3 rounded-2xl border bg-white p-4 transition hover:-translate-y-px hover:border-blue_munsell-300 hover:shadow-sm dark:bg-outer_space-500 dark:hover:border-blue_munsell-700",
									notification.read
										? "border-french_gray-300 dark:border-paynes_gray-800"
										: "border-blue_munsell-200 bg-blue_munsell-50/40 dark:border-blue_munsell-800 dark:bg-blue_munsell-950/20",
								)}
							>
								<NotificationIcon type={notification.type} />
								<div className="min-w-0 flex-1">
									<div className="flex items-start gap-2">
										<p className="flex-1 text-sm font-semibold text-outer_space-900 dark:text-platinum-50">
											{notification.title}
										</p>
										{!notification.read ? (
											<span className="mt-1.5 size-2 rounded-full bg-blue_munsell-500" />
										) : null}
									</div>
									<p className="mt-0.5 text-sm text-paynes_gray-500">
										{notification.message}
									</p>
									<p className="mt-1.5 text-xs text-paynes_gray-400">
										{formatRelativeDate(notification.createdAt)}
									</p>
								</div>
							</Link>
						))}
					</div>
					{pageCount > 1 ? (
						<nav
							aria-label="Notification pages"
							className="flex items-center justify-between gap-3 rounded-xl border border-french_gray-300 bg-white p-3 dark:border-paynes_gray-800 dark:bg-outer_space-500"
						>
							<Link
								href={`/notifications?page=${page - 1}`}
								aria-disabled={page <= 1}
								className={cn(
									"rounded-lg border border-french_gray-300 px-3 py-1.5 text-sm font-medium transition hover:bg-platinum-100 dark:border-paynes_gray-700 dark:hover:bg-outer_space-400",
									page <= 1 && "pointer-events-none opacity-40",
								)}
							>
								Previous
							</Link>
							<span className="text-sm text-paynes_gray-500">
								Page{" "}
								<strong className="text-outer_space-900 dark:text-platinum-50">
									{page}
								</strong>{" "}
								of {pageCount}
							</span>
							<Link
								href={`/notifications?page=${page + 1}`}
								aria-disabled={page >= pageCount}
								className={cn(
									"rounded-lg border border-french_gray-300 px-3 py-1.5 text-sm font-medium transition hover:bg-platinum-100 dark:border-paynes_gray-700 dark:hover:bg-outer_space-400",
									page >= pageCount && "pointer-events-none opacity-40",
								)}
							>
								Next
							</Link>
						</nav>
					) : null}
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-french_gray-300 bg-white p-12 text-center dark:border-paynes_gray-800 dark:bg-outer_space-500">
					<Bell className="mx-auto text-paynes_gray-400" />
					<p className="mt-3 font-medium">No notifications yet</p>
					<p className="mt-1 text-sm text-paynes_gray-500">
						Important team and task updates will appear here.
					</p>
				</div>
			)}
		</div>
	);
}
