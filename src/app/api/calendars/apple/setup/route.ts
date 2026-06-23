import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyFetch(`/calendars/apple/setup`, { method: "POST", body });
}
