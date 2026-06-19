import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  return proxyFetch(`/calendars/google/disconnect${qs}`, { method: "DELETE" });
}
