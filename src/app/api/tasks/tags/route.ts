import { proxyFetch } from "@/lib/proxy";

export async function GET() {
  return proxyFetch("/tasks/tags");
}
