import { fireEvent, render, screen } from "@testing-library/react";
import { DeadlineInput } from "@/components/ui/deadline-input";

describe("DeadlineInput", () => {
	beforeEach(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2026, 7, 25, 12));
	});

	afterEach(() => jest.useRealTimers());

	it("warns when the selected deadline is before today", () => {
		render(
			<DeadlineInput aria-label="Deadline date" defaultValue="2026-08-24" />,
		);

		expect(screen.getByRole("status")).toHaveTextContent(
			"This deadline is in the past and will be marked overdue.",
		);
		expect(screen.getByLabelText("Deadline date")).toHaveAttribute(
			"aria-describedby",
		);
	});

	it("does not warn for today or a future deadline", () => {
		const { rerender } = render(
			<DeadlineInput aria-label="Deadline date" defaultValue="2026-08-25" />,
		);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();

		rerender(
			<DeadlineInput aria-label="Deadline date" defaultValue="2026-08-26" />,
		);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("reports date changes to its consumer", () => {
		const onChange = jest.fn();
		render(<DeadlineInput aria-label="Deadline date" onChange={onChange} />);

		fireEvent.change(screen.getByLabelText("Deadline date"), {
			target: { value: "2026-08-26" },
		});

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(screen.getByLabelText("Deadline date")).toHaveValue("2026-08-26");
	});

	it("removes the warning after a past date is cleared", () => {
		render(
			<DeadlineInput aria-label="Deadline date" defaultValue="2026-08-24" />,
		);
		expect(screen.getByRole("status")).toBeVisible();
		fireEvent.change(screen.getByLabelText("Deadline date"), {
			target: { value: "" },
		});
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("preserves a caller-provided id for its warning relationship", () => {
		render(
			<DeadlineInput
				id="task-deadline"
				aria-label="Deadline date"
				defaultValue="2026-08-24"
			/>,
		);
		expect(screen.getByLabelText("Deadline date")).toHaveAttribute(
			"aria-describedby",
			"task-deadline-past-warning",
		);
		expect(screen.getByRole("status")).toHaveAttribute(
			"id",
			"task-deadline-past-warning",
		);
	});
});
