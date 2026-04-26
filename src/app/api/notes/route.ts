import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ASSISTET_API_URL!;
const TOKEN = process.env.ASSISTET_API_TOKEN!;

function headers() {
  return { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" };
}

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic");
  const url = `${BASE}/notes${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`;
  const res = await fetch(url, { headers: headers() });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${BASE}/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
