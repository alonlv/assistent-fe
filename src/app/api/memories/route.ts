import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return proxyFetch(`/memories${q ? `?q=${encodeURIComponent(q)}` : ""}`);
}
