import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  return proxyFetch(`/tasks${userId ? `?user_id=${encodeURIComponent(userId)}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/tasks", { method: "POST", body: await req.text() });
}
