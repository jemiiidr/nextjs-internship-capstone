import { fireEvent, render, screen } from "@testing-library/react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

describe("ConfirmationModal", () => {
	it("does not render while closed", () => {
		render(
			<ConfirmationModal
				open={false}
				onClose={jest.fn()}
				onConfirm={jest.fn()}
				title="Delete list?"
			>
				Deleting this list removes its tasks.
			</ConfirmationModal>,
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("renders an accessible dialog and invokes its actions", () => {
		const onClose = jest.fn();
		const onConfirm = jest.fn();
		render(
			<ConfirmationModal
				open
				onClose={onClose}
				onConfirm={onConfirm}
				title="Delete list?"
				confirmLabel="Delete list"
				minimal
			>
				Deleting this list removes its tasks.
			</ConfirmationModal>,
		);

		expect(
			screen.getByRole("dialog", { name: "Delete list?" }),
		).toHaveAttribute("aria-modal", "true");
		fireEvent.click(screen.getByRole("button", { name: "Delete list" }));
		expect(onConfirm).toHaveBeenCalledTimes(1);
		fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("closes on Escape and locks body scrolling while open", () => {
		const onClose = jest.fn();
		const { unmount } = render(
			<ConfirmationModal
				open
				onClose={onClose}
				onConfirm={jest.fn()}
				title="Delete project?"
			>
				This cannot be undone.
			</ConfirmationModal>,
		);

		expect(document.body.style.overflow).toBe("hidden");
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onClose).toHaveBeenCalledTimes(1);
		unmount();
		expect(document.body.style.overflow).toBe("");
	});

	it("disables actions and shows pending copy while deleting", () => {
		render(
			<ConfirmationModal
				open
				pending
				onClose={jest.fn()}
				onConfirm={jest.fn()}
				title="Delete task?"
			>
				This cannot be undone.
			</ConfirmationModal>,
		);
		expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Deleting…" })).toBeDisabled();
	});

	it("announces action errors", () => {
		render(
			<ConfirmationModal
				open
				error="Unable to delete this list."
				onClose={jest.fn()}
				onConfirm={jest.fn()}
				title="Delete list?"
			>
				This cannot be undone.
			</ConfirmationModal>,
		);
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Unable to delete this list.",
		);
	});
});
