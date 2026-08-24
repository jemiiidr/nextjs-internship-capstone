"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption { value: string; label: string; disabled?: boolean }

export function Select({ name, options, defaultValue, value, onValueChange, id, required, className }: {
	name?: string; options: SelectOption[]; defaultValue?: string; value?: string;
	onValueChange?: (value: string) => void; id?: string; required?: boolean; className?: string;
}) {
	const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const selectedValue = value ?? internalValue;
	const selected = options.find((option) => option.value === selectedValue);

	useEffect(() => {
		if (!open) return;
		const close = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);

	const choose = (nextValue: string) => {
		setInternalValue(nextValue);
		onValueChange?.(nextValue);
		setOpen(false);
	};

	return <div ref={rootRef} className={cn("relative", className)}>
		{name ? <input type="hidden" name={name} value={selectedValue} required={required} /> : null}
		<button id={id} type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="flex h-10 w-full items-center justify-between gap-3 rounded-lg border border-french_gray-300 bg-white px-3 text-left text-sm text-outer_space-900 shadow-sm transition hover:border-blue_munsell-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue_munsell-400 dark:border-paynes_gray-700 dark:bg-outer_space-400 dark:text-platinum-50">
			<span className={cn("truncate", !selectedValue && "text-paynes_gray-500")}>{selected?.label ?? "Select an option"}</span>
			<ChevronDown size={16} className={cn("shrink-0 text-paynes_gray-400 transition-transform duration-200", open && "rotate-180")} />
		</button>
		{open ? <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[80] animate-in fade-in slide-in-from-top-1 overflow-hidden rounded-xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-700 dark:bg-outer_space-400">
			{options.map((option) => <button key={option.value} type="button" disabled={option.disabled} onClick={() => choose(option.value)} className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-blue_munsell-50 hover:text-blue_munsell-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-blue_munsell-900/30 dark:hover:text-blue_munsell-200", option.value === selectedValue && "bg-blue_munsell-50 text-blue_munsell-700 dark:bg-blue_munsell-900/30 dark:text-blue_munsell-200")}><span className="truncate">{option.label}</span>{option.value === selectedValue ? <Check size={14} /> : null}</button>)}
		</div> : null}
	</div>;
}
