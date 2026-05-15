import { NextResponse } from "next/server";

const BASE = process.env.BACKEND_URL;
const TOKEN = process.env.APP_API_TOKEN;

if (!BASE || !TOKEN) {
  throw new Error(
    "Missing required environment variables: BACKEND_URL and APP_API_TOKEN must both be set"
  );
}

export async function proxyFetch(path: string, init?: RequestInit): Promise<NextResponse> {
  const url = `${BASE!}${path}`;

  try {
    const res = await fetch(url, {
      ...init,
      headers: { Authorization: `Bearer ${TOKEN!}`, "Content-Type": "application/json" },
    });

    if (res.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const text = await res.text();

    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed, { status: res.status });
    } catch {
      return new NextResponse(text, { status: res.status });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Backend unreachable:", err);
    return NextResponse.json({ error: "Backend service unavailable." }, { status: 503 });
  }
}
