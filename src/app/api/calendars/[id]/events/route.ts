import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = new URLSearchParams();
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const from = req.nextUrl.searchParams.get("from_time");
  const to = req.nextUrl.searchParams.get("to_time");
  if (callerId) p.set("caller_id", callerId);
  if (from) p.set("from_time", from);
  if (to) p.set("to_time", to);
  const qs = p.toString();
  return proxyFetch(`/calendars/${id}/events${qs ? `?${qs}` : ""}`);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFetch(`/calendars/${id}/events`, { method: "POST", body: await req.text() });
}
