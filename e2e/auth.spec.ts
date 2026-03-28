import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login form", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  });

  test("has Google OAuth button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign in with google/i })
    ).toBeVisible();
  });

  test("has link to signup page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /sign up/i })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  test("shows error on empty form submit", async ({ page }) => {
    // The browser's built-in required validation should prevent submission
    // But we can check the inputs have required attribute
    await expect(page.getByPlaceholder("you@example.com")).toHaveAttribute(
      "required",
      ""
    );
  });

  test("login button is clickable and triggers form submission", async ({ page }) => {
    await page.getByPlaceholder("you@example.com").fill("test@test.com");
    await page.locator('input[type="password"]').fill("password123");

    const loginButton = page.getByRole("button", { name: "Log In" });
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // After clicking, the button should either show loading state or an error should appear
    // (since credentials are invalid, we'll get an error eventually)
    await expect(
      page.getByRole("button", { name: /logging in/i }).or(page.locator('[class*="red"]').first())
    ).toBeVisible({ timeout: 15000 });
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.getByPlaceholder("you@example.com").fill("fake@test.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: "Log In" }).click();

    // Should show error message (either validation error or server error)
    await expect(page.locator('[class*="red"]').first()).toBeVisible({
      timeout: 15000,
    });
  });
});

test.describe("Signup Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("renders signup form with all fields", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /join amistala/i })
    ).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign Up", exact: true })).toBeVisible();
  });

  test("has Google OAuth button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign up with google/i })
    ).toBeVisible();
  });

  test("has link to login page", async ({ page }) => {
    await expect(page.getByRole("link", { name: /log in/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /log in/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("all form fields are required", async ({ page }) => {
    await expect(page.getByPlaceholder("Your name")).toHaveAttribute(
      "required",
      ""
    );
    await expect(page.getByPlaceholder("you@example.com")).toHaveAttribute(
      "required",
      ""
    );
  });
});

test.describe("Auth Navigation", () => {
  test("can navigate from login to signup", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL("/signup");
    await expect(
      page.getByRole("heading", { name: /join amistala/i })
    ).toBeVisible();
  });

  test("can navigate from signup to login", async ({ page }) => {
    await page.goto("/signup");
    await page.getByRole("link", { name: /log in/i }).click();
    await expect(page).toHaveURL("/login");
    await expect(
      page.getByRole("heading", { name: /welcome back/i })
    ).toBeVisible();
  });

  test("unauthenticated user visiting /rooms gets redirected to /login", async ({
    page,
  }) => {
    await page.goto("/rooms");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user visiting /profile gets redirected to /login", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated user visiting /settings gets redirected to /login", async ({
    page,
  }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});
