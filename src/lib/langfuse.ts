import { NodeSDK } from "@opentelemetry/sdk-node";
import { LangfuseSpanProcessor } from "@langfuse/otel";

let _started = false;
let _sdk: NodeSDK | null = null;

export function initLangfuse() {
  if (_started) return;

  // Only run in Node server environments
  if (typeof process === "undefined") return;

  const publicKey = process.env.LANGFUSE_PUBLIC_KEY;
  const secretKey = process.env.LANGFUSE_SECRET_KEY;
  const baseUrl = process.env.LANGFUSE_BASE_URL || process.env.LANGFUSE_BASEURL;

  try {
    const processor = new LangfuseSpanProcessor({
      publicKey,
      secretKey,
      baseUrl,
      exportMode: "immediate", // safe for serverless / short-lived processes
      environment: process.env.NODE_ENV,
      release: process.env.RELEASE,
    });

    _sdk = new NodeSDK({
      spanProcessors: [processor],
    });

    // Start SDK asynchronously; errors are caught and logged
    _sdk
      .start()
      .then(() => {
        _started = true;
        // eslint-disable-next-line no-console
        console.log("Langfuse SDK started");
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to start Langfuse SDK:", err);
      });

    // Ensure graceful shutdown
    process.on("beforeExit", async () => {
      try {
        if (_sdk) await _sdk.shutdown();
      } catch (e) {
        // ignore
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Langfuse initialization failed:", err);
  }
}
