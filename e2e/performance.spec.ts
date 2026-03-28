import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("landing page loads within 5 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000);
  });

  test("login page loads within 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });

  test("signup page loads within 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/signup", { waitUntil: "domcontentloaded" });
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(3000);
  });

  test("no console errors on landing page", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors (WebGL in headless, favicons, third-party)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") &&
        !e.includes("third-party") &&
        !e.includes("Failed to load resource") &&
        !e.includes("WebGL") &&
        !e.includes("THREE")
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("no JavaScript errors on login page", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      errors.push(err.message);
    });

    await page.goto("/login");
    await page.waitForTimeout(1000);

    expect(errors).toHaveLength(0);
  });

  test("images have alt attributes on landing page", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });
});
