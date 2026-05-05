import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  return proxyFetch("/topics");
}

export async function POST(req: NextRequest) {
  return proxyFetch("/topics", { method: "POST", body: await req.text() });
}
