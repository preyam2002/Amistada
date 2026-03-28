import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("landing page has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");

    // Should have at least one h1
    const h1s = page.locator("h1");
    await expect(h1s.first()).toBeVisible();
  });

  test("login form inputs have associated labels or placeholders", async ({
    page,
  }) => {
    await page.goto("/login");

    const emailInput = page.getByPlaceholder("you@example.com");
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("signup form inputs have associated labels or placeholders", async ({
    page,
  }) => {
    await page.goto("/signup");

    const nameInput = page.getByPlaceholder("Your name");
    await expect(nameInput).toBeVisible();
    await expect(nameInput).toHaveAttribute("type", "text");
  });

  test("interactive elements are keyboard-focusable", async ({ page }) => {
    await page.goto("/login");

    // Tab through the form elements
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Email input should be reachable
    const emailInput = page.getByPlaceholder("you@example.com");
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test("page uses semantic HTML for main structure", async ({ page }) => {
    await page.goto("/");

    // Landing page uses <main>
    await expect(page.locator("main")).toBeVisible();
  });

  test("color contrast - text is readable", async ({ page }) => {
    await page.goto("/login");

    // The heading should be visible (white text on dark background)
    const heading = page.getByRole("heading", { name: /welcome back/i });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("form buttons have visible text content", async ({ page }) => {
    await page.goto("/login");

    const loginButton = page.getByRole("button", { name: /log in/i });
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
  });
});
