import { test, expect } from "@playwright/test";

test.describe("Global Navigation", () => {
  test("landing page navbar has correct links", async ({ page }) => {
    await page.goto("/");

    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("404 page renders for unknown routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /go home/i })).toBeVisible();
  });

  test("404 page go home link works", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");

    await page.getByRole("link", { name: /go home/i }).click();
    await expect(page).toHaveURL("/");
  });
});
