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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  return proxyFetch(`${BASE}/topics/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const migrate_to = req.nextUrl.searchParams.get("migrate_to");
  const url = `${BASE}/topics/${id}${migrate_to ? `?migrate_to=${encodeURIComponent(migrate_to)}` : ""}`;
  return proxyFetch(url, { method: "DELETE" });
}
