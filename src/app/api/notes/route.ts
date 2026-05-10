import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic");
  const userId = req.nextUrl.searchParams.get("user_id");
  const params = new URLSearchParams();
  if (topic) params.set("topic", topic);
  if (userId) params.set("user_id", userId);
  const qs = params.toString();
  return proxyFetch(`/notes${qs ? `?${qs}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/notes", { method: "POST", body: await req.text() });
}
