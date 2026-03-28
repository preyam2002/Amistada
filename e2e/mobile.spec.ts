import { test, expect } from "@playwright/test";

// These tests run with the "mobile-chrome" project config (Pixel 5 viewport)
test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: { width: 393, height: 851 } });

  test("landing page renders correctly on mobile", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: /connect with people/i })
    ).toBeVisible();

    // CTAs should stack vertically on mobile
    await expect(page.getByRole("link", { name: /start chatting/i })).toBeVisible();
  });

  test("login page is mobile-friendly", async ({ page }) => {
    await page.goto("/login");

    // Form should be visible and usable
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();

    // Card should not overflow
    const card = page.locator(".max-w-md").first();
    const cardBox = await card.boundingBox();
    expect(cardBox).toBeTruthy();
    if (cardBox) {
      expect(cardBox.width).toBeLessThanOrEqual(393);
    }
  });

  test("signup page is mobile-friendly", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up", exact: true })).toBeVisible();
  });

  test("features section scrolls into view on mobile", async ({ page }) => {
    await page.goto("/");

    // Scroll to features
    await page.getByText("AI-Powered Matching").scrollIntoViewIfNeeded();
    await expect(page.getByText("AI-Powered Matching")).toBeVisible();
  });
});
