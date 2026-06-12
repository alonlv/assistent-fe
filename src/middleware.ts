import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "assistent_auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/health",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) {
    // Still iterate over both to prevent length-based timing leak
    let diff = ab.length ^ bb.length;
    for (let i = 0; i < Math.min(ab.length, bb.length); i++) diff |= ab[i] ^ bb[i];
    return false;
  }
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export function middleware(req: NextRequest): NextResponse {
  if (isPublic(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const expected = process.env.AUTH_TOKEN;

  if (!expected) {
    // AUTH_TOKEN not configured — block everything and show setup message
    return new NextResponse("AUTH_TOKEN env var is not set.", { status: 503 });
  }

  if (!token || !timingSafeEqual(token, expected)) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except Next.js internals and static public files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-|sw.js).*)",
  ],
};
