import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "notes_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

// Simple in-process rate limiter: max 10 attempts per IP per minute
const _attempts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function _checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = _attempts.get(ip);
  if (!record || record.resetAt < now) {
    _attempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  record.count += 1;
  return record.count <= RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!_checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, {
      status: 429,
      headers: { "Retry-After": "60" },
    });
  }

  const { password } = await req.json();

  const expectedPassword = process.env.AUTH_PASSWORD;
  const authToken = process.env.AUTH_TOKEN;

  if (!expectedPassword || !authToken) {
    return NextResponse.json({ error: "Auth not configured." }, { status: 503 });
  }

  // Constant-time comparison to prevent timing attacks
  const encoder = new TextEncoder();
  const a = encoder.encode(password ?? "");
  const b = encoder.encode(expectedPassword);

  let mismatch = a.length !== b.length ? 1 : 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    mismatch |= a[i] ^ b[i];
  }

  // Always delay to prevent timing oracle on both success and failure paths
  await new Promise((r) => setTimeout(r, 300));

  if (mismatch !== 0) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, authToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
