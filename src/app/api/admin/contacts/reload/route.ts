import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function POST() {
  return proxyFetch(`/admin/contacts/reload`, { method: "POST" });
}
