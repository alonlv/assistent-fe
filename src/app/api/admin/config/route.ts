import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  return proxyFetch("/admin/config");
}

export async function PUT(req: NextRequest) {
  return proxyFetch("/admin/config", { method: "PUT", body: await req.text() });
}
