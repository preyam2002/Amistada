import { test, expect } from "@playwright/test";

test.describe("Modals & Overlays (via E2E Harness)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.locator("[data-testid='tab-modals']").click();
    await page.waitForSelector("[data-testid='section-modals']");
  });

  test.describe("Generic Modal", () => {
    test("opens on button click", async ({ page }) => {
      await page.locator("[data-testid='open-modal']").click();
      await expect(page.locator("[data-testid='modal-content']")).toBeVisible();
      await expect(page.getByText("Test Modal")).toBeVisible();
    });

    test("has close button", async ({ page }) => {
      await page.locator("[data-testid='open-modal']").click();
      const closeBtn = page.locator('button[aria-label="Close modal"]');
      await expect(closeBtn).toBeVisible();
    });

    test("closes on X button click", async ({ page }) => {
      await page.locator("[data-testid='open-modal']").click();
      await expect(page.getByText("Test Modal")).toBeVisible();

      await page.locator('button[aria-label="Close modal"]').click();
      await expect(page.getByText("Test Modal")).not.toBeVisible();
    });

    test("closes on Escape key", async ({ page }) => {
      await page.locator("[data-testid='open-modal']").click();
      await expect(page.getByText("Test Modal")).toBeVisible();

      await page.keyboard.press("Escape");
      await expect(page.getByText("Test Modal")).not.toBeVisible();
    });

    test("closes on backdrop click", async ({ page }) => {
      await page.locator("[data-testid='open-modal']").click();
      await expect(page.getByText("Test Modal")).toBeVisible();

      // Click the backdrop (outside the modal content)
      await page.locator(".fixed.inset-0.z-50").click({ position: { x: 10, y: 10 } });
      await expect(page.getByText("Test Modal")).not.toBeVisible();
    });

    test("click inside modal does not close it", async ({ page }) => {
      await page.locator("[data-testid='open-modal']").click();
      await page.locator("[data-testid='modal-content']").click();
      await expect(page.getByText("Test Modal")).toBeVisible();
    });
  });

  test.describe("Compatibility Card", () => {
    test("opens and displays score", async ({ page }) => {
      await page.locator("[data-testid='open-compat']").click();
      await expect(page.getByText("87%")).toBeVisible();
    });

    test("displays summary and reason", async ({ page }) => {
      await page.locator("[data-testid='open-compat']").click();
      await expect(page.getByText("Cosmic Vibes")).toBeVisible();
      await expect(page.getByText(/creative pursuits/)).toBeVisible();
    });

    test("displays shared interests as chips", async ({ page }) => {
      await page.locator("[data-testid='open-compat']").click();
      await expect(page.getByText("Coding")).toBeVisible();
      await expect(page.getByText("Hiking")).toBeVisible();
      await expect(page.getByText("Music")).toBeVisible();
    });

    test("has Amistada Match badge", async ({ page }) => {
      await page.locator("[data-testid='open-compat']").click();
      await expect(page.getByText("Amistada Match")).toBeVisible();
    });

    test("has Save Image button", async ({ page }) => {
      await page.locator("[data-testid='open-compat']").click();
      await expect(page.getByText("Save Image")).toBeVisible();
    });

    test("closes on X click", async ({ page }) => {
      await page.locator("[data-testid='open-compat']").click();
      await expect(page.getByText("87%")).toBeVisible();

      // Close button is above the card
      await page.locator(".fixed.inset-0 button").first().click();
      await expect(page.getByText("87%")).not.toBeVisible();
    });
  });

  test.describe("Wrapped Story", () => {
    test("opens with intro slide", async ({ page }) => {
      await page.locator("[data-testid='open-wrapped']").click();
      // The Wrapped modal is full-screen with z-[100]
      const modal = page.locator(".fixed.inset-0.z-\\[100\\]");
      await expect(modal).toBeVisible();
      await expect(page.getByText("Your Amistada")).toBeVisible();
    });

    test("has progress bar segments", async ({ page }) => {
      await page.locator("[data-testid='open-wrapped']").click();
      await page.waitForTimeout(300);
      // Progress segments
      const segments = page.locator(".h-1.flex-1.bg-white\\/20");
      const count = await segments.count();
      expect(count).toBe(5);
    });

    test("can navigate to slide 2", async ({ page }) => {
      await page.locator("[data-testid='open-wrapped']").click();
      await page.waitForTimeout(300);

      // The right navigation area
      const rightNav = page.locator(".absolute.inset-0.z-0.flex > div").last();
      await rightNav.click();
      await page.waitForTimeout(300);

      // Slide 2 shows message/word stats
      await expect(page.getByText("142")).toBeVisible({ timeout: 3000 });
    });

    test("slide 2 shows stats", async ({ page }) => {
      await page.locator("[data-testid='open-wrapped']").click();
      await page.waitForTimeout(300);

      const rightNav = page.locator(".absolute.inset-0.z-0.flex > div").last();
      await rightNav.click();
      await page.waitForTimeout(300);

      await expect(page.getByText("142")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Messages Sent")).toBeVisible();
      await expect(page.getByText("3847")).toBeVisible();
      await expect(page.getByText("Words Typed")).toBeVisible();
    });

    test("closes on X button", async ({ page }) => {
      await page.locator("[data-testid='open-wrapped']").click();
      await page.waitForTimeout(300);

      // Close button at top-right with z-20
      const closeBtn = page.locator(".fixed.inset-0.z-\\[100\\] > button").first();
      await closeBtn.click();
      await page.waitForTimeout(300);

      await expect(page.locator(".fixed.inset-0.z-\\[100\\]")).not.toBeVisible();
    });
  });

  test.describe("Roast Badge", () => {
    test("opens and shows roast title", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      await expect(page.getByText("The Over-Thinker")).toBeVisible();
    });

    test("shows roast description", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      await expect(page.getByText(/crafting the perfect message/)).toBeVisible();
    });

    test("shows burn level badge", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      await expect(page.getByText("Burn Level: Medium")).toBeVisible();
    });

    test("shows Official Roast Badge label", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      await expect(page.getByText("Official Roast Badge")).toBeVisible();
    });

    test("has Save Badge button", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      await expect(page.getByText("Save Badge")).toBeVisible();
    });

    test("shows flame icon animation", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      const flame = page.locator(".animate-pulse").first();
      await expect(flame).toBeVisible();
    });

    test("closes on X click", async ({ page }) => {
      await page.locator("[data-testid='open-roast']").click();
      await expect(page.getByText("The Over-Thinker")).toBeVisible();

      await page.locator(".fixed.inset-0 button").first().click();
      await expect(page.getByText("The Over-Thinker")).not.toBeVisible();
    });
  });
});
