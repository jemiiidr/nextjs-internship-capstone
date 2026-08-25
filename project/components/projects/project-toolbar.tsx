"use client";

import { ArrowDownAZ, Check, ChevronDown, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CreateProjectButton } from "@/components/projects/create-project-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
	{ value: "created", label: "Date created" },
	{ value: "completion", label: "Completion" },
	{ value: "name", label: "Name" },
	{ value: "deadline", label: "Deadline" },
] as const;

export function ProjectToolbar({
	query,
	sort,
	order,
	canCreate,
}: {
	query: string;
	sort: string;
	order: string;
	canCreate: boolean;
}) {
	const router = useRouter();
	const rootRef = useRef<HTMLDivElement>(null);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;
		const close = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);

	const updateSort = (nextSort: string, nextOrder: string) => {
		setOpen(false);
		const params = new URLSearchParams();
		if (query) params.set("q", query);
		params.set("sort", nextSort);
		params.set("order", nextOrder);
		router.push(`/projects?${params.toString()}`);
	};

	return (
		<div className="flex flex-col gap-2 lg:flex-row lg:items-center">
			<form className="relative w-full lg:w-72">
				<Search
					className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paynes_gray-400"
					size={16}
				/>
				<Input
					name="q"
					defaultValue={query}
					placeholder="Search projects…"
					className="h-10 bg-white pl-10 dark:bg-outer_space-500"
				/>
				<input type="hidden" name="sort" value={sort} />
				<input type="hidden" name="order" value={order} />
				<button type="submit" className="sr-only">
					Search
				</button>
			</form>
			<div ref={rootRef} className="relative">
				<button
					type="button"
					onClick={() => setOpen((value) => !value)}
					aria-expanded={open}
					className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-french_gray-300 bg-white px-4 text-sm font-medium text-outer_space-900 shadow-sm hover:bg-platinum-100 lg:w-auto dark:border-paynes_gray-700 dark:bg-outer_space-400 dark:text-platinum-50 dark:hover:bg-outer_space-300"
				>
					<ArrowDownAZ size={16} /> Sort{" "}
					<ChevronDown
						size={14}
						className={cn("transition-transform", open && "rotate-180")}
					/>
				</button>
				{open ? (
					<div className="absolute right-0 top-[calc(100%+7px)] z-[80] w-64 rounded-2xl border border-french_gray-300 bg-white p-3 shadow-2xl dark:border-paynes_gray-700 dark:bg-outer_space-400">
						<p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-paynes_gray-500">
							Sort by
						</p>
						<div className="space-y-0.5">
							{SORT_OPTIONS.map((option) => (
								<button
									key={option.value}
									type="button"
									onClick={() => updateSort(option.value, order)}
									className={cn(
										"flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-platinum-100 dark:hover:bg-outer_space-300",
										sort === option.value &&
											"text-blue_munsell-600 dark:text-blue_munsell-300",
									)}
								>
									<span>{option.label}</span>
									{sort === option.value ? <Check size={14} /> : null}
								</button>
							))}
						</div>
						<div className="my-2 border-t border-french_gray-200 dark:border-paynes_gray-700" />
						<p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-paynes_gray-500">
							Direction
						</p>
						<div className="grid grid-cols-2 gap-1 rounded-xl bg-platinum-100 p-1 dark:bg-outer_space-300">
							<button
								type="button"
								onClick={() => updateSort(sort, "asc")}
								className={cn(
									"rounded-lg px-2 py-2 text-xs font-medium",
									order === "asc"
										? "bg-white text-blue_munsell-600 shadow-sm dark:bg-outer_space-500 dark:text-blue_munsell-300"
										: "text-paynes_gray-500",
								)}
							>
								Ascending
							</button>
							<button
								type="button"
								onClick={() => updateSort(sort, "desc")}
								className={cn(
									"rounded-lg px-2 py-2 text-xs font-medium",
									order === "desc"
										? "bg-white text-blue_munsell-600 shadow-sm dark:bg-outer_space-500 dark:text-blue_munsell-300"
										: "text-paynes_gray-500",
								)}
							>
								Descending
							</button>
						</div>
					</div>
				) : null}
			</div>
			{canCreate ? <CreateProjectButton /> : null}
		</div>
	);
}
