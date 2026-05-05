import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.BACKEND_URL!;
const TOKEN = process.env.APP_API_TOKEN!;

function backendHeaders() {
  return { "X-API-Key": TOKEN, "Content-Type": "application/json" };
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxyFetch(`${BASE}/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFetch(`${BASE}/tasks/${id}`, { method: "DELETE" });
}
