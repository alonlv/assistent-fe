import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  return proxyFetch("/reminders");
}

export async function POST(req: NextRequest) {
  return proxyFetch("/reminders", { method: "POST", body: await req.text() });
}
