import { Bell } from "lucide-react";
import type { Metadata } from "next";
import { NotificationInbox } from "@/components/dashboard/notification-center";
import { requireWorkspaceContext } from "@/lib/auth";
import { getUserNotifications } from "@/lib/notifications";
import { parsePositiveInteger } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

const PAGE_SIZE = 15;

export default async function NotificationsPage({
	searchParams,
}: {
	searchParams: Promise<{ page?: string }>;
}) {
	const context = await requireWorkspaceContext();
	const query = await searchParams;
	const page = parsePositiveInteger(query.page, 1, 10_000);
	const notifications = await getUserNotifications({
		userId: context.user.id,
		workspaceId: context.workspaceId,
		limit: PAGE_SIZE,
		page,
	});
	const pageCount = Math.max(
		Math.ceil(notifications.totalCount / PAGE_SIZE),
		1,
	);
	const currentPage = Math.min(page, pageCount);
	const pageNotifications =
		currentPage === page
			? notifications
			: await getUserNotifications({
					userId: context.user.id,
					workspaceId: context.workspaceId,
					limit: PAGE_SIZE,
					page: currentPage,
				});
	return (
		<div className="mx-auto max-w-4xl space-y-7">
			<header>
				{/* <p className="flex items-center gap-2 text-sm font-semibold text-blue_munsell-600 dark:text-blue_munsell-300">
					<Bell size={16} /> Inbox
				</p> */}
				<h1 className="mt-1 text-3xl font-bold tracking-tight text-outer_space-900 dark:text-platinum-50">
					Notifications
				</h1>
				<p className="mt-2 text-paynes_gray-500">
					Important assignments, deadlines, and team updates for this workspace.
				</p>
			</header>
			<NotificationInbox
				items={pageNotifications.items}
				unreadCount={pageNotifications.unreadCount}
				page={currentPage}
				pageCount={pageCount}
			/>
		</div>
	);
}
