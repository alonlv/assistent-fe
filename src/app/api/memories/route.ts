import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const userId = req.nextUrl.searchParams.get("user_id") ?? "";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (userId) params.set("user_id", userId);
  const qs = params.toString();
  return proxyFetch(`/memories${qs ? `?${qs}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/memories", { method: "POST", body: await req.text() });
}
