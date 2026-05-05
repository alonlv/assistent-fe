import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic");
  return proxyFetch(`/notes${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`);
}

export async function POST(req: NextRequest) {
  return proxyFetch("/notes", { method: "POST", body: await req.text() });
}
