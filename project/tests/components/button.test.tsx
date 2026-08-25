import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
	it("uses button semantics by default and handles activation", () => {
		const onClick = jest.fn();
		render(<Button onClick={onClick}>Save task</Button>);

		const button = screen.getByRole("button", { name: "Save task" });
		expect(button).toHaveAttribute("type", "button");
		fireEvent.click(button);
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("prevents activation while disabled", () => {
		const onClick = jest.fn();
		render(
			<Button disabled onClick={onClick}>
				Save task
			</Button>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Save task" }));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("honors an explicit submit type", () => {
		render(<Button type="submit">Continue</Button>);
		expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute(
			"type",
			"submit",
		);
	});

	it("merges caller classes with variant styles", () => {
		render(
			<Button variant="danger" className="test-marker">
				Delete
			</Button>,
		);
		expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
			"test-marker",
			"text-rose-700",
		);
	});
});
