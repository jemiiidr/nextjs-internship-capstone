import { registerOTel } from "@vercel/otel";
import { register } from "@/instrumentation";

jest.mock("@vercel/otel", () => ({
	registerOTel: jest.fn(),
}));

describe("OpenTelemetry instrumentation", () => {
	it("registers the Kanvas service", () => {
		register();

		expect(registerOTel).toHaveBeenCalledWith({ serviceName: "kanvas" });
	});
});
