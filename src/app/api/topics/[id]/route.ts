import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFetch(`/topics/${encodeURIComponent(id)}`, { method: "PUT", body: await req.text() });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const migrate_to = req.nextUrl.searchParams.get("migrate_to");
  return proxyFetch(`/topics/${encodeURIComponent(id)}${migrate_to ? `?migrate_to=${encodeURIComponent(migrate_to)}` : ""}`, { method: "DELETE" });
}
