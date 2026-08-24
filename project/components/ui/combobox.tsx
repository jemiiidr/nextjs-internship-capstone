"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function Combobox({ name, defaultValue = "", options, placeholder = "Choose or type a role", className }: { name: string; defaultValue?: string; options: string[]; placeholder?: string; className?: string }) {
	const [value, setValue] = useState(defaultValue);
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!open) return;
		const close = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
		document.addEventListener("pointerdown", close);
		return () => document.removeEventListener("pointerdown", close);
	}, [open]);
	const filtered = options.filter((option) => option.toLowerCase().includes(value.toLowerCase()) && option !== value);
	return <div ref={rootRef} className={cn("relative", className)}>
		<div className="flex h-10 rounded-lg border border-french_gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue_munsell-400 dark:border-paynes_gray-700 dark:bg-outer_space-400">
			<input name={name} value={value} onChange={(event) => { setValue(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder} required maxLength={40} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
			<button type="button" onClick={() => setOpen((current) => !current)} className="grid w-9 place-items-center text-paynes_gray-400" aria-label="Show role suggestions"><ChevronDown size={15} className={cn("transition-transform", open && "rotate-180")}/></button>
		</div>
		{open && filtered.length ? <div className="absolute inset-x-0 top-[calc(100%+6px)] z-[90] animate-in fade-in slide-in-from-top-1 rounded-xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-700 dark:bg-outer_space-400">{filtered.map((option) => <button key={option} type="button" onClick={() => { setValue(option); setOpen(false); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-blue_munsell-50 hover:text-blue_munsell-700 dark:hover:bg-blue_munsell-900/30">{option}</button>)}</div> : null}
	</div>;
}
