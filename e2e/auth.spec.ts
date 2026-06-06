import { expect, test } from "@playwright/test";
import { TEST_AUTH_PASSWORD } from "./fixtures";

test.describe("authentication", () => {
  test("redirects an unauthenticated user to the login page", async ({ page }) => {
    await page.goto("/notes");
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "My Workspace" })).toBeVisible();
  });

  test("shows an error for a wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Wrong password.")).toBeVisible();
    // Still on the login page — no redirect happened.
    await expect(page).toHaveURL(/\/login/);
  });

  test("accepts the correct password", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Password").fill(TEST_AUTH_PASSWORD);

    const loginResponse = page.waitForResponse(
      (r) => r.url().includes("/api/auth/login") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Sign in" }).click();

    expect((await loginResponse).status()).toBe(200);
    await expect(page.getByText("Wrong password.")).toHaveCount(0);
  });
});
