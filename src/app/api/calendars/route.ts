import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return proxyFetch(`/calendars${qs}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/calendars", { method: "POST", body: await req.text() });
}
