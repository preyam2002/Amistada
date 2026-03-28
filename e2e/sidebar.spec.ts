import { test, expect } from "@playwright/test";

test.describe("Sidebar Features (via E2E Harness)", () => {
  // The harness page doesn't have a sidebar since it's not inside the app layout.
  // We test sidebar behavior via the landing-to-auth flow and static analysis.

  test.describe("Create Room Dialog", () => {
    // This tests the component as rendered in the authenticated layout.
    // Since we can't auth, we verify the component structure via the codebase.
    // We'll test the interactive parts through the components harness instead.

    test("create room flow via direct page navigation requires auth", async ({ page }) => {
      await page.goto("/rooms");
      await expect(page).toHaveURL(/\/login/);
    });
  });
});

test.describe("Profile Page (auth redirect)", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Settings Page (auth redirect)", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Chat Room (auth redirect)", () => {
  test("redirects to login for any room ID when not authenticated", async ({ page }) => {
    await page.goto("/rooms/some-room-id");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Chat Export Feature (via E2E Harness)", () => {
  test("export chat downloads a txt file", async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.waitForSelector("[data-testid='section-chat']");

    // Set up download listener
    const downloadPromise = page.waitForEvent("download", { timeout: 5000 });
    await page.locator('button[title="Export chat (.txt)"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/chat-.+\.txt/);
  });
});

test.describe("Chat Copy Room Link (via E2E Harness)", () => {
  test("copy room link button exists and is clickable", async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.waitForSelector("[data-testid='section-chat']");

    const btn = page.locator('button[title="Copy room link"]');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });
});

test.describe("Chat Typing Indicator Integration", () => {
  test("chat input exists on harness page", async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.waitForSelector("[data-testid='section-chat']");

    const input = page.locator('input[placeholder*="Message"]');
    await expect(input).toBeVisible();

    // Typing in the input should not crash (typing indicator hook may fail without Supabase but shouldn't throw)
    await input.fill("test message");
    await expect(input).toHaveValue("test message");
  });
});

test.describe("Chat Message Interactions (via E2E Harness)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.waitForSelector("[data-testid='section-chat']");
  });

  test("copy message button shows Copied feedback", async ({ page }) => {
    // Grant clipboard permission
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);

    const copyBtn = page.locator("text=Copy").first();
    await copyBtn.click();

    await expect(page.getByText("Copied").first()).toBeVisible({ timeout: 2000 });
  });

  test("like button toggles visual state", async ({ page }) => {
    const likeBtn = page.locator("text=Like").first();
    await likeBtn.click();

    // After clicking, the button should show "Liked" and have pink styling
    const liked = page.getByText("Liked").first();
    await expect(liked).toBeVisible();

    // The parent should have the active class
    const parent = liked.locator("..");
    await expect(parent).toHaveClass(/border-\[#FB7185\]/);
  });

  test("reply button shows reply preview and populates input", async ({ page }) => {
    const replyBtn = page.locator("text=Reply").first();
    await replyBtn.click();

    // Reply banner should appear
    await expect(page.getByText("Replying to:")).toBeVisible();

    // Input should have the quoted text
    const input = page.locator('input[placeholder*="Message"]');
    const value = await input.inputValue();
    expect(value).toContain(">");
  });
});
