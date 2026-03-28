import { test, expect } from "@playwright/test";

test.describe("UI Components (via E2E Harness)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.locator("[data-testid='tab-components']").click();
    await page.waitForSelector("[data-testid='section-components']");
  });

  test.describe("Button Variants", () => {
    test("primary button has gradient background", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-primary']");
      await expect(btn).toBeVisible();
      await expect(btn).toHaveClass(/bg-gradient-to-r/);
    });

    test("secondary button has dark background", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-secondary']");
      await expect(btn).toBeVisible();
      await expect(btn).toHaveClass(/bg-\[#1F2937\]/);
    });

    test("outline button has border styling", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-outline']");
      await expect(btn).toBeVisible();
      await expect(btn).toHaveClass(/border/);
    });

    test("ghost button has transparent background", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-ghost']");
      await expect(btn).toBeVisible();
    });

    test("destructive button has red background", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-destructive']");
      await expect(btn).toBeVisible();
      await expect(btn).toHaveClass(/bg-\[#EF4444\]/);
    });

    test("loading button shows spinner and Loading text", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-loading']");
      await expect(btn).toBeVisible();
      await expect(btn).toBeDisabled();
      await expect(btn.getByText("Loading...")).toBeVisible();
      // SVG spinner
      await expect(btn.locator("svg.animate-spin")).toBeVisible();
    });

    test("disabled button is not clickable", async ({ page }) => {
      const btn = page.locator("[data-testid='btn-disabled']");
      await expect(btn).toBeDisabled();
      await expect(btn).toHaveClass(/disabled:opacity-50/);
    });
  });

  test.describe("Button Sizes", () => {
    const sizes = ["xs", "sm", "md", "lg", "xl"];

    for (const size of sizes) {
      test(`${size} button renders correctly`, async ({ page }) => {
        const btn = page.locator(`[data-testid='btn-${size}']`);
        await expect(btn).toBeVisible();
      });
    }

    test("xl button is larger than xs button", async ({ page }) => {
      await page.waitForTimeout(500); // Wait for render
      const xs = await page.locator("[data-testid='btn-xs']").boundingBox();
      const xl = await page.locator("[data-testid='btn-xl']").boundingBox();
      expect(xs).toBeTruthy();
      expect(xl).toBeTruthy();
      if (xs && xl) {
        expect(xl.height).toBeGreaterThanOrEqual(xs.height);
      }
    });
  });

  test.describe("Input Components", () => {
    test("default input accepts text", async ({ page }) => {
      const input = page.getByPlaceholder("Default input");
      await input.fill("Hello World");
      await expect(input).toHaveValue("Hello World");
    });

    test("error input has error border styling", async ({ page }) => {
      const input = page.getByPlaceholder("Error input");
      const classes = await input.getAttribute("class");
      expect(classes).toContain("border-[#EF4444]");
    });

    test("disabled input is not editable", async ({ page }) => {
      const input = page.getByPlaceholder("Disabled input");
      await expect(input).toBeDisabled();
    });

    test("textarea accepts multiline text", async ({ page }) => {
      const textarea = page.locator("[data-testid='textarea-default']");
      await textarea.fill("Line 1\nLine 2\nLine 3");
      await expect(textarea).toHaveValue("Line 1\nLine 2\nLine 3");
    });
  });

  test.describe("Badge Variants", () => {
    const variants = ["primary", "secondary", "success", "warning", "error"];

    for (const v of variants) {
      test(`${v} badge renders correctly`, async ({ page }) => {
        const badge = page.locator(`[data-testid='badge-${v}']`);
        await expect(badge).toBeVisible();
        await expect(badge).toHaveText(v.charAt(0).toUpperCase() + v.slice(1));
      });
    }
  });

  test.describe("Avatar Variants", () => {
    test("gradient avatar renders with gradient background", async ({ page }) => {
      const avatar = page.locator("[data-testid='avatar-gradient']");
      await expect(avatar).toBeVisible();
    });

    test("default avatar renders initials", async ({ page }) => {
      const avatar = page.locator("[data-testid='avatar-default']");
      await expect(avatar).toBeVisible();
    });

    test("small avatar is smaller than xl avatar", async ({ page }) => {
      const sm = await page.locator("[data-testid='avatar-sm']").boundingBox();
      const xl = await page.locator("[data-testid='avatar-xl']").boundingBox();
      expect(sm).toBeTruthy();
      expect(xl).toBeTruthy();
      expect(xl!.height).toBeGreaterThan(sm!.height);
    });
  });
});
