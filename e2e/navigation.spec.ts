import { test, expect } from "@playwright/test";

test.describe("Navigation & Routing", () => {
  test("404 page for unknown routes", async ({ page }) => {
    await page.goto("/this-route-does-not-exist-at-all");
    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });

  test("404 page has Go Home link", async ({ page }) => {
    await page.goto("/nonexistent-page");
    const link = page.getByRole("link", { name: /go home/i });
    await expect(link).toBeVisible();
  });

  test("404 Go Home navigates to /", async ({ page }) => {
    await page.goto("/nonexistent-page");
    await page.getByRole("link", { name: /go home/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("landing page -> login navigation", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav").getByRole("link", { name: "Login" }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("landing page -> signup navigation", async ({ page }) => {
    await page.goto("/");
    await page.locator("nav").getByRole("link", { name: "Sign Up" }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("login -> signup -> login round-trip", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/\/signup/);

    await page.getByRole("link", { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test("e2e harness page loads", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      if (!err.message.includes("WebGL") && !err.message.includes("THREE") && !err.message.includes("error is not a function") && !err.message.includes("useToast")) {
        errors.push(err.message);
      }
    });

    await page.goto("/e2e-harness");
    await expect(page.locator("[data-testid='harness-tabs']")).toBeVisible();
  });

  test("e2e harness tabs switch sections", async ({ page }) => {
    await page.goto("/e2e-harness");

    await page.locator("[data-testid='tab-components']").click();
    await expect(page.locator("[data-testid='section-components']")).toBeVisible();

    await page.locator("[data-testid='tab-modals']").click();
    await expect(page.locator("[data-testid='section-modals']")).toBeVisible();

    await page.locator("[data-testid='tab-toasts']").click();
    await expect(page.locator("[data-testid='section-toasts']")).toBeVisible();

    await page.locator("[data-testid='tab-cards']").click();
    await expect(page.locator("[data-testid='section-cards']")).toBeVisible();

    await page.locator("[data-testid='tab-chat']").click();
    await expect(page.locator("[data-testid='section-chat']")).toBeVisible();
  });
});
