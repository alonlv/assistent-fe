import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  return proxyFetch("/proactive-tasks");
}

export async function POST(req: NextRequest) {
  return proxyFetch("/proactive-tasks", { method: "POST", body: await req.text() });
}
