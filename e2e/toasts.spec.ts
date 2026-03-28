import { test, expect } from "@playwright/test";

test.describe("Toast Notifications (via E2E Harness)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.locator("[data-testid='tab-toasts']").click();
    await page.waitForSelector("[data-testid='section-toasts']");
  });

  test("success toast appears with green styling", async ({ page }) => {
    await page.locator("[data-testid='toast-success']").click();
    const toast = page.locator("text=Success message");
    await expect(toast).toBeVisible();
    // Check parent has success class
    const toastContainer = toast.locator("..");
    await expect(toastContainer).toHaveClass(/border-\[#34D399\]/);
  });

  test("error toast appears with red styling", async ({ page }) => {
    await page.locator("[data-testid='toast-error']").click();
    const toast = page.locator("text=Error message");
    await expect(toast).toBeVisible();
    const toastContainer = toast.locator("..");
    await expect(toastContainer).toHaveClass(/border-red-500/);
  });

  test("warning toast appears with amber styling", async ({ page }) => {
    await page.locator("[data-testid='toast-warning']").click();
    const toast = page.locator("text=Warning message");
    await expect(toast).toBeVisible();
    const toastContainer = toast.locator("..");
    await expect(toastContainer).toHaveClass(/border-\[#FBBF24\]/);
  });

  test("info toast appears with purple styling", async ({ page }) => {
    await page.locator("[data-testid='toast-info']").click();
    const toast = page.locator("text=Info message");
    await expect(toast).toBeVisible();
    const toastContainer = toast.locator("..");
    await expect(toastContainer).toHaveClass(/border-\[#A78BFA\]/);
  });

  test("toast has close button", async ({ page }) => {
    await page.locator("[data-testid='toast-success']").click();
    const toast = page.locator("text=Success message").locator("..");
    const closeBtn = toast.locator("button");
    await expect(closeBtn).toBeVisible();
  });

  test("toast closes on X click", async ({ page }) => {
    await page.locator("[data-testid='toast-success']").click();
    const toastText = page.locator("text=Success message");
    await expect(toastText).toBeVisible();

    const toast = toastText.locator("..");
    await toast.locator("button").click();
    await expect(toastText).not.toBeVisible();
  });

  test("toast auto-dismisses after ~4 seconds", async ({ page }) => {
    await page.locator("[data-testid='toast-info']").click();
    await expect(page.locator("text=Info message")).toBeVisible();

    // Wait for auto-dismiss (4000ms + animation buffer)
    await page.waitForTimeout(5000);
    await expect(page.locator("text=Info message")).not.toBeVisible();
  });

  test("multiple toasts stack vertically", async ({ page }) => {
    await page.locator("[data-testid='toast-success']").click();
    await page.locator("[data-testid='toast-error']").click();
    await page.locator("[data-testid='toast-warning']").click();

    await expect(page.locator("text=Success message")).toBeVisible();
    await expect(page.locator("text=Error message")).toBeVisible();
    await expect(page.locator("text=Warning message")).toBeVisible();
  });
});
