import { expect, test } from "@playwright/test";

test("landing page presents the primary Kanvas actions", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", {
			name: /turn every plan into a living kanvas/i,
		}),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: /create your kanvas/i }),
	).toHaveAttribute("href", "/sign-up");
	await expect(
		page.getByRole("link", { name: /view your workspace/i }),
	).toHaveAttribute("href", "/sign-in");
});

test("sign-up navigation reaches the branded authentication route", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByRole("link", { name: /create your kanvas/i }).click();
	await expect(page).toHaveURL(/\/sign-up/);
	await expect(
		page.getByRole("link", { name: /back to kanvas home/i }),
	).toBeVisible();
});

test("sign-in navigation reaches the branded authentication route", async ({
	page,
}) => {
	await page.goto("/");
	await page.getByRole("link", { name: "Log in" }).first().click();
	await expect(page).toHaveURL(/\/sign-in/);
	await expect(
		page.getByRole("link", { name: /back to kanvas home/i }),
	).toBeVisible();
});

test("landing feature sections remain discoverable", async ({ page }) => {
	await page.goto("/");
	await expect(
		page.getByRole("heading", {
			name: /structure when you need it\. space when you don’t/i,
		}),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /see the shape of work as it changes/i }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: /a separate kanvas for every team/i }),
	).toBeVisible();
});
