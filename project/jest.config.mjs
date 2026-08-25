import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config = {
	clearMocks: true,
	collectCoverageFrom: [
		"components/**/*.{ts,tsx}",
		"lib/**/*.{ts,tsx}",
		"!**/*.d.ts",
		"!lib/db/**",
	],
	coverageDirectory: "coverage",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
	testEnvironment: "jsdom",
	testMatch: [
		"<rootDir>/tests/unit/**/*.test.[jt]s?(x)",
		"<rootDir>/tests/components/**/*.test.[jt]s?(x)",
	],
	testPathIgnorePatterns: ["<rootDir>/tests/e2e/", "<rootDir>/.next/"],
};

export default createJestConfig(config);
