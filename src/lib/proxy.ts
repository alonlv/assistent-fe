import { NextResponse } from "next/server";
import { startActiveObservation } from "@langfuse/tracing";
import { initLangfuse } from "./langfuse";

const BASE = process.env.BACKEND_URL;
const TOKEN = process.env.APP_API_TOKEN;

if (!BASE || !TOKEN) {
  throw new Error(
    "Missing required environment variables: BACKEND_URL and APP_API_TOKEN must both be set"
  );
}

// Initialize Langfuse SDK (no-op if env not configured)
try {
  initLangfuse();
} catch (e) {
  // ignore init failures - tracing should not break the app
  // eslint-disable-next-line no-console
  console.error("Langfuse init error:", e);
}

export async function proxyFetch(path: string, init?: RequestInit): Promise<NextResponse> {
  return startActiveObservation(
    "backend-proxy",
    async (tool) => {
      const url = `${BASE!}${path}`;
      const method = (init && (init.method as string)) || "GET";

      // Record high-level inputs (do NOT capture secrets)
      tool.update({ input: { url, method }, metadata: { service: "backend-proxy" } });

      try {
        const res = await fetch(url, {
          ...init,
          headers: { Authorization: `Bearer ${TOKEN!}`, "Content-Type": "application/json" },
        });

        if (res.status === 204) {
          tool.update({ output: { status: 204 } });
          return new NextResponse(null, { status: 204 });
        }

        const text = await res.text();

        try {
          const parsed = JSON.parse(text);
          tool.update({ output: { status: res.status, body: typeof parsed === "object" ? parsed : String(parsed) } });
          return NextResponse.json(parsed, { status: res.status });
        } catch {
          tool.update({ output: { status: res.status, body: text } });
          return new NextResponse(text, { status: res.status });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        tool.update({ level: "ERROR", statusMessage: msg, output: { error: msg } });
        // eslint-disable-next-line no-console
        console.error("Backend unreachable:", err);
        return NextResponse.json({ error: "Backend service unavailable." }, { status: 503 });
      }
    },
    { asType: "tool" }
  );
}
