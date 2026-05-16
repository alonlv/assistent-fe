import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}/permissions/${userId}${qs}`, { method: "PUT", body: await req.text() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}/permissions/${userId}${qs}`, { method: "DELETE" });
}
