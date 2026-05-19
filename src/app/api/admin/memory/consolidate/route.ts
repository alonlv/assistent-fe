import { proxyFetch } from "@/lib/proxy";

export async function POST() {
  return proxyFetch("/admin/memory/consolidate", { method: "POST" });
}
