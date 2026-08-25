"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface ConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	children: ReactNode;
	confirmLabel?: string;
	pending?: boolean;
	error?: string;
	minimal?: boolean;
}

export function ConfirmationModal({
	open,
	onClose,
	onConfirm,
	title,
	children,
	confirmLabel = "Delete",
	pending = false,
	error,
	minimal = false,
}: ConfirmationModalProps) {
	return (
		<Modal
			open={open}
			onClose={onClose}
			title={title}
			description="This action cannot be undone."
			className="max-w-md"
		>
			<div className="space-y-5">
				{minimal ? (
					<div className="text-sm text-paynes_gray-600 dark:text-french_gray-300">
						{children}
					</div>
				) : (
					<div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-100">
						<AlertTriangle
							className="mt-0.5 shrink-0"
							size={20}
							aria-hidden="true"
						/>
						<div className="text-sm">{children}</div>
					</div>
				)}
				{error ? (
					<p role="alert" className="text-sm text-red-600 dark:text-red-400">
						{error}
					</p>
				) : null}
				<div className="flex justify-end gap-2">
					<Button variant="secondary" onClick={onClose} disabled={pending}>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={onConfirm}
						disabled={pending}
						className={
							minimal
								? "bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent"
								: undefined
						}
					>
						{minimal ? null : <Trash2 size={16} />}
						{pending ? "Deleting…" : confirmLabel}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
