import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const params = new URLSearchParams();
  const userId = req.nextUrl.searchParams.get("user_id");
  const kind = req.nextUrl.searchParams.get("kind");
  if (userId) params.set("user_id", userId);
  if (kind) params.set("kind", kind);
  const qs = params.toString();
  return proxyFetch(`/automations${qs ? `?${qs}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/automations", { method: "POST", body: await req.text() });
}
