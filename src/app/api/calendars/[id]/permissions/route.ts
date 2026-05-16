import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}/permissions${qs}`);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}/permissions${qs}`, { method: "POST", body: await req.text() });
}
