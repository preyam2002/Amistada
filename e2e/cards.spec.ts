import { test, expect } from "@playwright/test";

test.describe("Soul Card (via E2E Harness)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.locator("[data-testid='tab-cards']").click();
    await page.waitForSelector("[data-testid='section-cards']");
  });

  test("renders soul card with user name", async ({ page }) => {
    await expect(page.getByText("Test User")).toBeVisible();
  });

  test("shows Amistala Soul Card header", async ({ page }) => {
    await expect(page.getByText("Amistala Soul Card")).toBeVisible();
  });

  test("displays primary persona badge", async ({ page }) => {
    await expect(page.getByText('"The Architect"')).toBeVisible();
  });

  test("displays secondary persona badge", async ({ page }) => {
    await expect(page.getByText("The Explorer")).toBeVisible();
  });

  test("shows interests chips", async ({ page }) => {
    await expect(page.getByText("Coding")).toBeVisible();
    await expect(page.getByText("Hiking")).toBeVisible();
    await expect(page.getByText("Music")).toBeVisible();
    await expect(page.getByText("Reading")).toBeVisible();
    await expect(page.getByText("Travel")).toBeVisible();
  });

  test("shows user initials avatar", async ({ page }) => {
    // SoulCard shows first 2 chars uppercased
    await expect(page.getByText("TE").first()).toBeVisible();
  });

  test("shows Vibes with section", async ({ page }) => {
    await expect(page.getByText('"Vibes with..."')).toBeVisible();
  });

  test("has Save Image button", async ({ page }) => {
    await expect(page.getByText("Save Image")).toBeVisible();
  });

  test("has Share button", async ({ page }) => {
    await expect(page.getByText("Share")).toBeVisible();
  });

  test("shows Level 1 badge on avatar", async ({ page }) => {
    await expect(page.getByText("Level 1")).toBeVisible();
  });

  test("shows footer branding", async ({ page }) => {
    await expect(page.getByText("amistala.com")).toBeVisible();
  });
});
