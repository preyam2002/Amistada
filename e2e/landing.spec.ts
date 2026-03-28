import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders hero section with main heading", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /connect with people/i })
    ).toBeVisible();
  });

  test("renders navigation bar with brand name", async ({ page }) => {
    await expect(page.locator("nav")).toBeVisible();
  });

  test("has sign up and sign in CTAs", async ({ page }) => {
    await expect(page.getByRole("link", { name: /start chatting/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("sign up CTA links to /signup", async ({ page }) => {
    const signupLink = page.getByRole("link", { name: /start chatting/i });
    await expect(signupLink).toHaveAttribute("href", "/signup");
  });

  test("sign in CTA links to /login", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /sign in/i });
    await expect(loginLink).toHaveAttribute("href", "/login");
  });

  test("renders features section", async ({ page }) => {
    await expect(page.getByText("AI-Powered Matching")).toBeVisible();
    await expect(page.getByText("Secure & Private")).toBeVisible();
    await expect(page.getByText("Group Communities")).toBeVisible();
  });

  test("renders footer", async ({ page }) => {
    await expect(page.locator("footer")).toBeVisible();
  });

  test("page has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/amistada/i);
  });

  test("3D scene canvas loads", async ({ page }) => {
    // The Three.js scene renders a canvas element
    const canvas = page.locator("canvas");
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });
});
