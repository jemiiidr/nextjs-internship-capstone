"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";

export function CreateProjectButton() {
	const openCreateProject = useUIStore((state) => state.openCreateProject);
	return (
		<Button onClick={openCreateProject}>
			<Plus size={18} /> New project
		</Button>
	);
}
