import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return proxyFetch(`/user-data/${encodeURIComponent(id)}`);
}
