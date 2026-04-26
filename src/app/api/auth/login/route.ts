import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "notes_auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
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

  if (mismatch !== 0) {
    // Fixed delay to prevent timing oracle even on length mismatch
    await new Promise((r) => setTimeout(r, 300));
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return res;
}
