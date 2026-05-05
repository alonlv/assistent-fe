import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFetch(`/proactive-tasks/${id}`, { method: "DELETE" });
}
