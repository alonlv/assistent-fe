import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  return proxyFetch(`/admin/config/${encodeURIComponent(key)}`, { method: "DELETE" });
}
