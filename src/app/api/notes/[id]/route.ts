import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ASSISTET_API_URL!;
const TOKEN = process.env.ASSISTET_API_TOKEN!;

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${BASE}/notes/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  return new NextResponse(null, { status: res.status });
}
