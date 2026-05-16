import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = req.nextUrl.searchParams.get("user_id");
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return proxyFetch(`/calendars/${id}${qs}`);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}${qs}`, { method: "PUT", body: await req.text() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const callerId = req.nextUrl.searchParams.get("caller_id");
  const qs = callerId ? `?caller_id=${encodeURIComponent(callerId)}` : "";
  return proxyFetch(`/calendars/${id}${qs}`, { method: "DELETE" });
}
