import { test, expect } from "@playwright/test";

test.describe("Mobile Responsiveness", () => {
  test.describe("iPhone SE viewport (375x667)", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("landing page hero fits viewport", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Connect with people who")).toBeVisible();

      // CTA buttons should be visible
      await expect(page.getByRole("link", { name: /start chatting/i })).toBeVisible();
    });

    test("navbar is compact on mobile", async ({ page }) => {
      await page.goto("/");
      const nav = page.locator("nav");
      const box = await nav.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test("login form fits mobile viewport", async ({ page }) => {
      await page.goto("/login");
      const form = page.locator("form").first();
      const box = await form.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test("login form is fully usable on mobile", async ({ page }) => {
      await page.goto("/login");
      await page.getByPlaceholder("you@example.com").fill("test@test.com");
      await page.locator('input[type="password"]').fill("password");
      await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Log In" })).toBeEnabled();
    });

    test("signup form fits mobile viewport", async ({ page }) => {
      await page.goto("/signup");
      const form = page.locator("form").first();
      const box = await form.boundingBox();
      expect(box).toBeTruthy();
      expect(box!.width).toBeLessThanOrEqual(375);
    });

    test("features stack in single column", async ({ page }) => {
      await page.goto("/");
      await page.getByText("AI-Powered Matching").scrollIntoViewIfNeeded();

      const feature1 = await page.getByText("AI-Powered Matching").boundingBox();
      const feature2 = await page.getByText("Real-time Translation").boundingBox();
      expect(feature1).toBeTruthy();
      expect(feature2).toBeTruthy();

      // On mobile, features should stack (feature2 below feature1)
      expect(feature2!.y).toBeGreaterThan(feature1!.y);
    });
  });

  test.describe("iPad viewport (768x1024)", () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test("landing page renders properly", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Connect with people who")).toBeVisible();
    });

    test("login card centers properly", async ({ page }) => {
      await page.goto("/login");
      const card = page.locator(".max-w-md").first();
      const box = await card.boundingBox();
      expect(box).toBeTruthy();
      // Card should be centered (some margin on both sides)
      expect(box!.x).toBeGreaterThan(0);
      expect(box!.x + box!.width).toBeLessThan(768);
    });
  });

  test.describe("Desktop viewport (1280x720)", () => {
    test.use({ viewport: { width: 1280, height: 720 } });

    test("features display in 3-column grid", async ({ page }) => {
      await page.goto("/");
      await page.getByText("AI-Powered Matching").scrollIntoViewIfNeeded();

      const f1 = await page.getByText("AI-Powered Matching").boundingBox();
      const f2 = await page.getByText("Real-time Translation").boundingBox();
      expect(f1).toBeTruthy();
      expect(f2).toBeTruthy();

      // On desktop, features should be side by side (same Y roughly)
      expect(Math.abs(f1!.y - f2!.y)).toBeLessThan(50);
    });
  });
});
