import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UserSummary } from "@/types";

export function AvatarStack({
	users,
	total,
	limit = 4,
	className,
}: {
	users: UserSummary[];
	total?: number;
	limit?: number;
	className?: string;
}) {
	const shown = users.slice(0, limit);
	const remaining = Math.max((total ?? users.length) - shown.length, 0);
	return (
		<div className={cn("flex items-center -space-x-2", className)}>
			{shown.map((user) => (
				<Avatar
					key={user.id}
					name={user.name}
					src={user.avatarUrl}
					className="size-8 border-2 border-white text-[10px] dark:border-outer_space-400"
				/>
			))}
			{remaining > 0 ? (
				<span className="grid size-8 place-items-center rounded-full border-2 border-white bg-platinum-200 text-[10px] font-semibold text-paynes_gray-600 dark:border-outer_space-400 dark:bg-outer_space-300 dark:text-french_gray-300">
					+{remaining}
				</span>
			) : null}
		</div>
	);
}
