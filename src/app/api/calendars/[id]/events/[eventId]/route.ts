import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  return proxyFetch(`/calendars/${id}/events/${eventId}`, { method: "PATCH", body: await req.text() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; eventId: string }> }) {
  const { id, eventId } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}/events/${eventId}${qs}`, { method: "DELETE" });
}
