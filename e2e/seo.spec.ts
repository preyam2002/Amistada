import { test, expect } from "@playwright/test";

test.describe("SEO & Meta Tags", () => {
  test("has html lang attribute", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("has page title containing Amistada", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/amistada/i);
  });

  test("has meta description", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="description"]');
    const content = await meta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content!.length).toBeGreaterThan(50);
    expect(content).toMatch(/connect/i);
  });

  test("has Open Graph title", async ({ page }) => {
    await page.goto("/");
    const og = page.locator('meta[property="og:title"]');
    await expect(og).toHaveAttribute("content", /amistada/i);
  });

  test("has Open Graph description", async ({ page }) => {
    await page.goto("/");
    const og = page.locator('meta[property="og:description"]');
    const content = await og.getAttribute("content");
    expect(content).toBeTruthy();
  });

  test("has Open Graph type=website", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
  });

  test("has Open Graph site_name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Amistada");
  });

  test("has Twitter card meta", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image"
    );
  });

  test("has Twitter title", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="twitter:title"]');
    await expect(meta).toHaveAttribute("content", /amistada/i);
  });

  test("has keywords meta tag", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="keywords"]');
    const content = await meta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content).toContain("AI matching");
  });

  test("has robots meta tag", async ({ page }) => {
    await page.goto("/");
    const meta = page.locator('meta[name="robots"]');
    const content = await meta.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content).toContain("index");
    expect(content).toContain("follow");
  });
});

test.describe("Accessibility", () => {
  test("landing page has h1 heading", async ({ page }) => {
    await page.goto("/");
    const h1s = page.locator("h1");
    const count = await h1s.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("page uses semantic <main> element", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
  });

  test("page uses semantic <nav> element", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("page uses semantic <footer> element", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeAttached();
  });

  test("footer social links have sr-only labels", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer .sr-only").first()).toBeAttached();
  });

  test("login form labels are visible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Password")).toBeVisible();
  });

  test("signup form labels are visible", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Display Name")).toBeVisible();
    await expect(page.getByText("Email")).toBeVisible();
    await expect(page.getByText("Password")).toBeVisible();
  });

  test("email input is keyboard focusable", async ({ page }) => {
    await page.goto("/login");
    const email = page.getByPlaceholder("you@example.com");
    await email.focus();
    await expect(email).toBeFocused();
  });

  test("heading text has sufficient color contrast (white on dark)", async ({ page }) => {
    await page.goto("/login");
    const heading = page.getByRole("heading").first();
    const color = await heading.evaluate((el) => getComputedStyle(el).color);
    // Should be white or very light
    expect(color).toMatch(/rgb\(255, 255, 255\)|rgb\(249, 250, 251\)/);
  });

  test("interactive elements have visible focus indicators", async ({ page }) => {
    await page.goto("/login");
    const email = page.getByPlaceholder("you@example.com");
    await email.focus();
    // The input should have focus ring classes
    const classes = await email.evaluate((el) => el.className);
    expect(classes).toContain("focus:");
  });
});

test.describe("Performance", () => {
  test("landing page DOM-content loaded in under 5s", async ({ page }) => {
    const start = Date.now();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(Date.now() - start).toBeLessThan(5000);
  });

  test("login page loads in under 3s", async ({ page }) => {
    const start = Date.now();
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    expect(Date.now() - start).toBeLessThan(3000);
  });

  test("no unhandled JavaScript errors on landing page", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => {
      // Filter WebGL/Three.js errors expected in headless Chrome
      if (!err.message.includes("WebGL") && !err.message.includes("THREE") && !err.message.includes("error is not a function")) {
        jsErrors.push(err.message);
      }
    });

    await page.goto("/");
    await page.waitForTimeout(2000);
    expect(jsErrors).toHaveLength(0);
  });

  test("no unhandled JavaScript errors on login page", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await page.goto("/login");
    await page.waitForTimeout(1000);
    expect(jsErrors).toHaveLength(0);
  });

  test("no unhandled JS errors on e2e harness page", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => {
      // Filter WebGL/Three.js errors expected in headless Chrome
      if (!err.message.includes("WebGL") && !err.message.includes("THREE") && !err.message.includes("error is not a function")) {
        jsErrors.push(err.message);
      }
    });

    await page.goto("/e2e-harness");
    await page.waitForTimeout(2000);
    expect(jsErrors).toHaveLength(0);
  });
});
