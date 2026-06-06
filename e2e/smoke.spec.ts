import { expect, test } from "@playwright/test";
import { authenticate, stubBackend } from "./fixtures";

test.describe("smoke", () => {
  test("health endpoint responds ok", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    expect(await res.json()).toEqual({ ok: true });
  });

  test("authenticated user reaches the app shell", async ({ page, context }) => {
    await authenticate(context);
    await stubBackend(page);

    await page.goto("/notes");

    // Middleware let us through — we did not bounce back to /login.
    await expect(page).toHaveURL(/\/notes/);
    // The persistent navigation renders, proving the protected layout mounted.
    await expect(page.getByRole("link", { name: "Tasks" })).toBeVisible();
  });

  test("authenticated user can navigate between sections", async ({ page, context }) => {
    await authenticate(context);
    await stubBackend(page);

    await page.goto("/notes");
    await page.getByRole("link", { name: "Tasks" }).click();
    await expect(page).toHaveURL(/\/tasks/);
  });
});
