import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const params = new URLSearchParams();
  const userId = req.nextUrl.searchParams.get("user_id");
  const tag = req.nextUrl.searchParams.get("tag");
  if (userId) params.set("user_id", userId);
  if (tag) params.set("tag", tag);
  const qs = params.toString();
  return proxyFetch(`/tasks${qs ? `?${qs}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/tasks", { method: "POST", body: await req.text() });
}
