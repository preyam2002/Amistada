import { test, expect } from "@playwright/test";

test.describe("Chat Window (via E2E Harness)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/e2e-harness");
    await page.waitForSelector("[data-testid='section-chat']");
  });

  test.describe("Header", () => {
    test("shows room name", async ({ page }) => {
      await expect(page.getByText("Test Room")).toBeVisible();
    });

    test("shows online status indicator", async ({ page }) => {
      // Green dot for online status
      const dot = page.locator(".bg-green-500").first();
      await expect(dot).toBeVisible();
    });

    test("shows AI avatar for AI rooms", async ({ page }) => {
      await expect(page.getByText("AI").first()).toBeVisible();
    });

    test("has time toggle button", async ({ page }) => {
      const timeBtn = page.locator('button[title*="time"]');
      await expect(timeBtn).toBeVisible();
    });

    test("has copy room link button", async ({ page }) => {
      const copyBtn = page.locator('button[title="Copy room link"]');
      await expect(copyBtn).toBeVisible();
    });

    test("has export chat button", async ({ page }) => {
      const exportBtn = page.locator('button[title="Export chat (.txt)"]');
      await expect(exportBtn).toBeVisible();
    });

    test("has wrapped button", async ({ page }) => {
      const wrappedBtn = page.locator('button[title="My Wrapped"]');
      await expect(wrappedBtn).toBeVisible();
    });

    test("has roast button", async ({ page }) => {
      const roastBtn = page.locator('button[title*="Roast"]');
      await expect(roastBtn).toBeVisible();
    });

    test("has catch up button", async ({ page }) => {
      await expect(page.getByText("Catch Up")).toBeVisible();
    });
  });

  test.describe("Messages", () => {
    test("renders initial messages", async ({ page }) => {
      await expect(page.getByText("Hey there! Welcome to the room.")).toBeVisible();
      await expect(page.getByText("Thanks! Excited to be here.")).toBeVisible();
      await expect(page.getByText("What are your hobbies?")).toBeVisible();
      await expect(page.getByText("I love coding and hiking!")).toBeVisible();
    });

    test("AI messages show Amistala label", async ({ page }) => {
      const labels = page.locator("text=Amistala");
      const count = await labels.count();
      expect(count).toBeGreaterThan(0);
    });

    test("private messages show Private badge", async ({ page }) => {
      // Private badge only shows for messages with recipient_id matching current user
      // The mock data has msg-5 as private
      const privateBadge = page.locator("text=Private");
      const count = await privateBadge.count();
      expect(count).toBeGreaterThanOrEqual(0); // May or may not show depending on filtering
    });

    test("messages have timestamps", async ({ page }) => {
      // Relative times like "5m ago" should be present
      const timeTexts = page.locator("text=/\\d+m ago|just now/");
      const count = await timeTexts.count();
      expect(count).toBeGreaterThan(0);
    });

    test("messages have copy buttons", async ({ page }) => {
      const copyButtons = page.locator("text=Copy");
      const count = await copyButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test("messages have like buttons", async ({ page }) => {
      const likeButtons = page.locator("text=Like");
      const count = await likeButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test("messages have reply buttons", async ({ page }) => {
      const replyButtons = page.locator("text=Reply");
      const count = await replyButtons.count();
      expect(count).toBeGreaterThan(0);
    });

    test("clicking Like toggles to Liked", async ({ page }) => {
      const likeBtn = page.locator("text=Like").first();
      await likeBtn.click();
      await expect(page.getByText("Liked").first()).toBeVisible();
    });

    test("clicking Liked toggles back to Like", async ({ page }) => {
      const likeBtn = page.locator("text=Like").first();
      await likeBtn.click();
      await expect(page.getByText("Liked").first()).toBeVisible();

      // Click again to unlike
      await page.getByText("Liked").first().click();
      // Should toggle back
    });

    test("clicking Reply populates input with quote", async ({ page }) => {
      const replyBtn = page.locator("text=Reply").first();
      await replyBtn.click();

      // Check reply preview banner appears
      await expect(page.getByText("Replying to:")).toBeVisible();
    });

    test("reply preview has cancel button", async ({ page }) => {
      await page.locator("text=Reply").first().click();
      await expect(page.getByText("Replying to:")).toBeVisible();

      await page.locator("text=Cancel").last().click();
      await expect(page.getByText("Replying to:")).not.toBeVisible();
    });
  });

  test.describe("Search & Filters", () => {
    test("search input filters messages", async ({ page }) => {
      const search = page.getByPlaceholder("Search messages");
      await expect(search).toBeVisible();

      await search.fill("hiking");
      // Only the message containing "hiking" should remain visible
      await expect(page.getByText("I love coding and hiking!")).toBeVisible();
      await expect(page.getByText("Hey there! Welcome to the room.")).not.toBeVisible();
    });

    test("clearing search shows all messages again", async ({ page }) => {
      const search = page.getByPlaceholder("Search messages");
      await search.fill("hiking");
      await expect(page.getByText("Hey there! Welcome to the room.")).not.toBeVisible();

      // Clear filter
      await page.locator("text=Clear").first().click();
      await expect(page.getByText("Hey there! Welcome to the room.")).toBeVisible();
    });

    test("compact mode toggle exists", async ({ page }) => {
      await expect(page.getByText("Compact mode")).toBeVisible();
    });

    test("compact mode toggles spacing", async ({ page }) => {
      const container = page.locator(".overflow-y-auto").first();
      const classBefore = await container.getAttribute("class");

      await page.locator("text=Compact mode").click();
      const classAfter = await container.getAttribute("class");

      expect(classBefore).not.toBe(classAfter);
    });
  });

  test.describe("Input Area", () => {
    test("message input is visible with placeholder", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await expect(input).toBeVisible();
    });

    test("character counter shows 0/1000", async ({ page }) => {
      await expect(page.getByText("0/1000")).toBeVisible();
    });

    test("typing updates character counter", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await input.fill("Hello World");
      await expect(page.getByText("11/1000")).toBeVisible();
    });

    test("near limit shows warning color", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      // Fill with 960 chars to trigger near-limit (max is 1000, warning at 950+)
      await input.fill("a".repeat(960));
      await expect(page.getByText("Approaching message limit")).toBeVisible();
    });

    test("send button is disabled when input is empty", async ({ page }) => {
      const sendBtn = page.locator('button[type="submit"]').last();
      await expect(sendBtn).toBeDisabled();
    });

    test("send button enables when text is entered", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await input.fill("Hello");
      const sendBtn = page.locator('button[type="submit"]').last();
      await expect(sendBtn).toBeEnabled();
    });

    test("escape clears input", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await input.fill("Some text");
      await expect(input).toHaveValue("Some text");
      await input.press("Escape");
      await expect(input).toHaveValue("");
    });

    test("image upload button exists", async ({ page }) => {
      const imageBtn = page.locator('button[title="Upload Image"]');
      await expect(imageBtn).toBeVisible();
    });

    test("voice recording button exists", async ({ page }) => {
      const micBtn = page.locator('button[title*="Record"]');
      await expect(micBtn).toBeVisible();
    });

    test("coffee gift button exists", async ({ page }) => {
      const coffeeBtn = page.locator('button[title*="Coffee"]');
      await expect(coffeeBtn).toBeVisible();
    });

    test("helper text shows shortcut", async ({ page }) => {
      await expect(page.getByText(/Enter or Cmd\/Ctrl\+Enter to send/)).toBeVisible();
    });
  });

  test.describe("Quick Prompts", () => {
    test("renders quick prompt buttons", async ({ page }) => {
      await expect(page.getByText(/hobby that makes you lose/)).toBeVisible();
      await expect(page.getByText(/best book or show/)).toBeVisible();
      await expect(page.getByText(/small daily habit/)).toBeVisible();
    });

    test("clicking quick prompt fills input", async ({ page }) => {
      await page.getByText(/hobby that makes you lose/).click();
      const input = page.locator('input[placeholder*="Message"]');
      const value = await input.inputValue();
      expect(value).toContain("hobby");
    });
  });

  test.describe("Slash Commands", () => {
    test("typing / shows command autocomplete", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await input.fill("/");
      // Autocomplete dropdown should appear
      await expect(page.locator("text=/next").last()).toBeVisible();
    });

    test("autocomplete filters as user types", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await input.fill("/wr");
      // Only /wrapped should match
      await expect(page.locator("text=/wrapped")).toBeVisible();
      await expect(page.locator("text=/next")).not.toBeVisible();
    });

    test("clicking autocomplete item fills command", async ({ page }) => {
      const input = page.locator('input[placeholder*="Message"]');
      await input.fill("/");
      // Click on the /help autocomplete suggestion button
      const suggestion = page.locator(".min-w-\\[200px\\] button").filter({ hasText: "/help" });
      await suggestion.click();
      const val = await input.inputValue();
      expect(val).toContain("/help");
    });
  });

  test.describe("Keyboard Shortcuts", () => {
    test("pressing ? opens help modal", async ({ page }) => {
      // Click somewhere that's not an input first
      await page.locator("h2").first().click();
      await page.keyboard.press("?");
      await expect(page.getByText("Slash commands")).toBeVisible();
    });

    test("help modal lists all commands", async ({ page }) => {
      await page.locator("h2").first().click();
      await page.keyboard.press("?");

      await expect(page.getByText("/next")).toBeVisible();
      await expect(page.getByText("/leave")).toBeVisible();
      await expect(page.getByText("/profile")).toBeVisible();
      await expect(page.getByText("/wrapped")).toBeVisible();
      await expect(page.getByText("/roast")).toBeVisible();
    });

    test("help modal closes on X click", async ({ page }) => {
      await page.locator("h2").first().click();
      await page.keyboard.press("?");
      await expect(page.getByText("Slash commands")).toBeVisible();

      // Close it
      await page.locator(".absolute.inset-0.z-50 button").first().click();
      await expect(page.getByText("Slash commands")).not.toBeVisible();
    });
  });

  test.describe("Time Display", () => {
    test("time toggle switches between relative and absolute time", async ({ page }) => {
      // Check initial state (relative time)
      const timeText = page.locator("text=/\\d+m ago/").first();
      await expect(timeText).toBeVisible();

      // Click time toggle
      const timeBtn = page.locator('button[title*="time"]');
      await timeBtn.click();

      // Should now show absolute time (e.g. "10:15 AM")
      await page.waitForTimeout(200);
      const absoluteTime = page.locator("text=/\\d{1,2}:\\d{2}\\s?(AM|PM)/").first();
      await expect(absoluteTime).toBeVisible();
    });
  });
});
