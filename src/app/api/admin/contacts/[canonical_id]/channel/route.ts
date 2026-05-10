import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function POST(req: NextRequest, { params }: { params: Promise<{ canonical_id: string }> }) {
  const resolvedParams = await params;
  return proxyFetch(`/admin/contacts/${encodeURIComponent(resolvedParams.canonical_id)}/channel`, { method: "POST", body: await req.text() });
}
