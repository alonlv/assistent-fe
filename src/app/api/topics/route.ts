import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.BACKEND_URL!;
const TOKEN = process.env.APP_API_TOKEN!;

function backendHeaders() {
  return { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
}

async function proxyFetch(url: string, init?: RequestInit): Promise<NextResponse> {
  try {
    const res = await fetch(url, { ...init, headers: backendHeaders() });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const text = await res.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: res.status });
    } catch {
      return new NextResponse(text, { status: res.status });
    }
  } catch (err) {
    console.error("Backend unreachable:", err);
    return NextResponse.json({ error: "Backend service unavailable." }, { status: 503 });
  }
}

export async function GET() {
  return proxyFetch(`${BASE}/topics`);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return proxyFetch(`${BASE}/topics`, { method: "POST", body: JSON.stringify(body) });
}
