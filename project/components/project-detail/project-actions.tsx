"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteProjectAction } from "@/app/actions/projects";
import { EditProjectModal } from "@/components/projects/edit-project-modal";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import type { MemberRole, ProjectMember, ProjectSummary, UserSummary } from "@/types";

export function ProjectActions({ project, members, workspaceUsers, role }: { project: Pick<ProjectSummary, "id" | "name" | "description" | "dueDate" | "iconDataUrl">; members: ProjectMember[]; workspaceUsers: UserSummary[]; role: MemberRole }) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [error, setError] = useState("");
	const [pending, startTransition] = useTransition();
	const ref = useRef<HTMLDivElement>(null);
	const router = useRouter();
	useEffect(() => { if (!menuOpen) return; const close = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) setMenuOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, [menuOpen]);
	const remove = () => startTransition(async () => { const result = await deleteProjectAction(project.id); if (result.success) router.replace("/projects"); else setError(result.message); });
	return <><div ref={ref} className="relative"><Button variant="secondary" size="icon" onClick={() => setMenuOpen((value) => !value)} aria-label="Project actions"><MoreHorizontal size={18}/></Button>{menuOpen ? <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-48 animate-in fade-in slide-in-from-top-1 rounded-xl border border-french_gray-300 bg-white p-1.5 shadow-xl dark:border-paynes_gray-700 dark:bg-outer_space-400"><button type="button" onClick={() => { setMenuOpen(false); setEditOpen(true); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-platinum-100 dark:hover:bg-outer_space-300"><Pencil size={14}/> Edit Project</button><button type="button" onClick={() => { setMenuOpen(false); setError(""); setDeleteOpen(true); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/30"><Trash2 size={14}/> Delete Project</button></div> : null}</div>
	<EditProjectModal project={project} members={members} workspaceUsers={workspaceUsers} role={role} open={editOpen} onClose={() => setEditOpen(false)}/>
	<ConfirmationModal open={deleteOpen} onClose={() => !pending && setDeleteOpen(false)} onConfirm={remove} title="Delete project?" confirmLabel="Delete project" pending={pending} error={error}><p>Deleting <strong>{project.name}</strong> permanently removes its lists, tasks, comments, and activity.</p></ConfirmationModal></>;
}
