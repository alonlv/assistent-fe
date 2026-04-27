import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "notes_auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/health",
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
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

  if (!token || token !== expected) {
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
