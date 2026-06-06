import type { BrowserContext, Page } from "@playwright/test";

// Test credentials — kept in sync with playwright.config.ts webServer.env.
export const TEST_AUTH_PASSWORD = process.env.AUTH_PASSWORD ?? "test-password";
export const TEST_AUTH_TOKEN = process.env.AUTH_TOKEN ?? "test-auth-token";

const AUTH_COOKIE = "notes_auth";

/**
 * Seed the session cookie directly so protected routes are reachable without
 * going through the login round-trip. The real login route sets a `secure`
 * cookie, which is awkward to rely on over plain HTTP in CI — the middleware
 * only checks the cookie value, so seeding it here is equivalent.
 */
export async function authenticate(context: BrowserContext): Promise<void> {
  await context.addCookies([
    {
      name: AUTH_COOKIE,
      value: TEST_AUTH_TOKEN,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
    },
  ]);
}

/**
 * Stub the Next.js API routes that proxy to the FastAPI backend so the E2E
 * suite stays hermetic (no live backend required). Auth and health routes are
 * left untouched because they run entirely in the frontend.
 */
export async function stubBackend(page: Page): Promise<void> {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/auth") || url.pathname === "/api/health") {
      return route.fallback();
    }
    // Empty collection is a valid response for every list endpoint the UI calls.
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });
}
