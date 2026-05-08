import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function DELETE(req: NextRequest) {
  return proxyFetch(`/admin/contacts/identities`, { method: "DELETE", body: await req.text() });
}
