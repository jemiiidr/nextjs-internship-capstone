"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decodeLabel, encodeLabel } from "@/lib/utils";

export function LabelEditor({ initialLabels = [] }: { initialLabels?: string[] }) {
	const [labels, setLabels] = useState(initialLabels);
	const [name, setName] = useState("");
	const [color, setColor] = useState("#2563eb");
	const addLabel = () => {
		const trimmed = name.trim();
		if (!trimmed || labels.length >= 8) return;
		setLabels((current) => [...current.filter((label) => decodeLabel(label).name.toLowerCase() !== trimmed.toLowerCase()), encodeLabel(trimmed, color)]);
		setName("");
	};

	return <div className="space-y-2">
		<input type="hidden" name="labels" value={labels.join(",")} />
		{labels.length ? <div className="flex flex-wrap gap-2">{labels.map((label) => {
			const decoded = decodeLabel(label);
			return <span key={label} className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium" style={{ borderColor: `${decoded.color}55`, backgroundColor: `${decoded.color}18`, color: decoded.color }}>{decoded.name}<button type="button" onClick={() => setLabels((current) => current.filter((item) => item !== label))} aria-label={`Remove ${decoded.name}`}><X size={12} /></button></span>;
		})}</div> : null}
		<div className="flex gap-2">
			<Input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLabel(); } }} placeholder="Add a label" maxLength={40} />
			<input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border border-french_gray-300 bg-white p-1 dark:border-paynes_gray-700 dark:bg-outer_space-400" aria-label="Label color" />
			<Button type="button" variant="secondary" size="icon" onClick={addLabel} disabled={!name.trim() || labels.length >= 8} aria-label="Add label"><Plus size={16} /></Button>
		</div>
		<p className="text-xs text-paynes_gray-500">Choose any label color. Priority colors remain separate.</p>
	</div>;
}
