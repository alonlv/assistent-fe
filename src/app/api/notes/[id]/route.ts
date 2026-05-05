import { NextRequest } from "next/server";
import { proxyFetch } from "@/lib/proxy";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFetch(`/notes/${id}`, { method: "PUT", body: await req.text() });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyFetch(`/notes/${id}`, { method: "DELETE" });
}
