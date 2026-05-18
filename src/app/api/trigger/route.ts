import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id") ?? "";
  if (!userId) {
    return Response.json({ error: "user_id is required" }, { status: 400 });
  }
  return proxyFetch(`/trigger/${encodeURIComponent(userId)}`, {
    method: "POST",
    body: await req.text(),
  });
}
