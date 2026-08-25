"use client";

import { X } from "lucide-react";
import { type ReactNode, useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}

export function Modal({
	open,
	onClose,
	title,
	description,
	children,
	className,
}: ModalProps) {
	const titleId = useId();
	const descriptionId = useId();

	useEffect(() => {
		if (!open) {
			return;
		}

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, onClose]);

	if (!open) {
		return null;
	}

	return createPortal(
		<div className="fixed inset-0 z-[9999] grid h-dvh w-screen place-items-center overflow-hidden bg-outer_space-500/70 p-4">
			{/* Backdrop */}
			<button
				type="button"
				aria-label="Close dialog"
				className="fixed inset-0"
				onClick={onClose}
			/>

			{/* Dialog */}
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={description ? descriptionId : undefined}
				className={cn(
					"relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-french_gray-300 bg-white p-6 shadow-2xl dark:border-paynes_gray-400 dark:bg-outer_space-500",
					className,
				)}
			>
				<div className="mb-5 flex items-start justify-between gap-4">
					<div>
						<h2
							id={titleId}
							className="text-xl font-semibold text-outer_space-500 dark:text-platinum-500"
						>
							{title}
						</h2>

						{description ? (
							<p
								id={descriptionId}
								className="mt-1 text-sm text-paynes_gray-500 dark:text-french_gray-400"
							>
								{description}
							</p>
						) : null}
					</div>

					<Button
						type="button"
						variant="ghost"
						size="icon"
						aria-label="Close dialog"
						onClick={onClose}
					>
						<X size={18} />
					</Button>
				</div>

				{children}
			</div>
		</div>,
		document.body,
	);
}
