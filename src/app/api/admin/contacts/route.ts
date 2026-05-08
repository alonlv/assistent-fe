import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  return proxyFetch("/admin/contacts");
}

export async function POST(req: NextRequest) {
  return proxyFetch("/admin/contacts", { method: "POST", body: await req.text() });
}
