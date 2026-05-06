"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LlmProvider {
  base_url: string;
  model: string;
  api_key: string;
  supports_text: boolean;
  supports_image: boolean;
}

interface Config {
  agent_name: string;
  agent_timezone: string;
  agent_max_tool_rounds: number;
  agent_verbose_responses: boolean;
  organizer_name: string;
  organizer_email: string;
  llm_providers: LlmProvider[];
  prompt_core: string;
  prompt_memory: string;
  prompt_proactive: string;
  prompt_notes: string;
}

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

type Tab = "general" | "prompt" | "providers";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? body?.error ?? String(res.status));
  }
  return res.json();
}

let _toastId = 0;

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [config, setConfig] = useState<Config | null>(null);
  const [defaults, setDefaults] = useState<Partial<Config>>({});
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function toast(message: string, type: Toast["type"] = "info") {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfgRes, defsRes] = await Promise.all([
        apiFetch<{ effective: Config }>("/api/admin/config"),
        apiFetch<Partial<Config>>("/api/admin/config/defaults"),
      ]);
      setConfig(cfgRes.effective);
      setProviders(cfgRes.effective.llm_providers ?? []);
      setDefaults(defsRes);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  async function saveField(key: keyof Config, value: unknown) {
    try {
      await apiFetch("/api/admin/config", {
        method: "PUT",
        body: JSON.stringify({ [key]: value }),
      });
      setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
      toast(`Saved ${key}`, "success");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function resetField(key: keyof Config) {
    try {
      await apiFetch(`/api/admin/config/${key}`, { method: "DELETE" });
      toast(`Reset ${key} to default`, "info");
      await loadConfig();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  async function saveProviders() {
    const valid = providers.filter((p) => p.base_url && p.model && p.api_key);
    if (!valid.length) { toast("No valid providers to save", "error"); return; }
    await saveField("llm_providers", valid);
  }

  function updateProvider(idx: number, patch: Partial<LlmProvider>) {
    setProviders((prev) => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  }

  function addProvider() {
    setProviders((prev) => [...prev, { base_url: "", model: "", api_key: "", supports_text: true, supports_image: false }]);
  }

  function removeProvider(idx: number) {
    setProviders((prev) => prev.filter((_, i) => i !== idx));
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Loading…</div>;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-12 px-4">
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">{error}</p>
        <Button variant="outline" onClick={loadConfig}>Retry</Button>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-5">Admin</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(["general", "prompt", "providers"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* General Tab */}
      {tab === "general" && (
        <div className="space-y-6">
          <Section title="Agent Identity">
            <Field label="Agent Name">
              <FieldRow
                value={config.agent_name}
                onChange={(v) => setConfig({ ...config, agent_name: v })}
                onSave={() => saveField("agent_name", config.agent_name)}
                onReset={() => resetField("agent_name")}
              />
            </Field>
            <Field label="Timezone (IANA)">
              <FieldRow
                value={config.agent_timezone}
                onChange={(v) => setConfig({ ...config, agent_timezone: v })}
                onSave={() => saveField("agent_timezone", config.agent_timezone)}
                onReset={() => resetField("agent_timezone")}
                placeholder="e.g. Asia/Jerusalem"
              />
            </Field>
            <Field label="Max Tool Rounds">
              <FieldRow
                value={String(config.agent_max_tool_rounds)}
                onChange={(v) => setConfig({ ...config, agent_max_tool_rounds: parseInt(v) || 0 })}
                onSave={() => saveField("agent_max_tool_rounds", config.agent_max_tool_rounds)}
                onReset={() => resetField("agent_max_tool_rounds")}
                type="number"
              />
            </Field>
            <Field label="">
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  id="verbose"
                  checked={config.agent_verbose_responses}
                  onChange={(e) => setConfig({ ...config, agent_verbose_responses: e.target.checked })}
                  className="w-4 h-4 cursor-pointer accent-primary"
                />
                <label htmlFor="verbose" className="text-sm cursor-pointer">Verbose responses</label>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveField("agent_verbose_responses", config.agent_verbose_responses)}>Save</Button>
                <Button size="sm" variant="outline" onClick={() => resetField("agent_verbose_responses")}>Reset</Button>
              </div>
            </Field>
          </Section>

          <Section title="Meeting Organizer">
            <Field label="Organizer Name">
              <FieldRow
                value={config.organizer_name}
                onChange={(v) => setConfig({ ...config, organizer_name: v })}
                onSave={() => saveField("organizer_name", config.organizer_name)}
                onReset={() => resetField("organizer_name")}
                placeholder="Your full name"
              />
            </Field>
            <Field label="Organizer Email">
              <FieldRow
                value={config.organizer_email}
                onChange={(v) => setConfig({ ...config, organizer_email: v })}
                onSave={() => saveField("organizer_email", config.organizer_email)}
                onReset={() => resetField("organizer_email")}
                placeholder="you@example.com"
              />
            </Field>
          </Section>
        </div>
      )}

      {/* Prompt Tab */}
      {tab === "prompt" && (
        <div className="space-y-6">
          {(
            [
              { key: "prompt_core" as const, label: "Core Behavior" },
              { key: "prompt_memory" as const, label: "Memory Rules" },
              { key: "prompt_proactive" as const, label: "Proactive Tasks" },
              { key: "prompt_notes" as const, label: "Notes Guidelines" },
            ] as const
          ).map(({ key, label }) => (
            <Section key={key} title={label}>
              <p className="text-xs text-muted-foreground mb-2">
                Use{" "}
                <code className="bg-muted px-1 rounded">{"{agent_name}"}</code> and{" "}
                <code className="bg-muted px-1 rounded">{"{agent_timezone}"}</code> as placeholders.
              </p>
              <textarea
                value={config[key]}
                onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                rows={8}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => saveField(key, config[key])}>Save</Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await apiFetch(`/api/admin/config/${key}`, { method: "DELETE" }).catch((e) => { toast((e as Error).message, "error"); throw e; });
                    setConfig((prev) => prev ? { ...prev, [key]: (defaults[key] as string) ?? "" } : prev);
                    toast(`Reset ${key} to default`, "info");
                  }}
                >
                  Reset to default
                </Button>
              </div>
            </Section>
          ))}
        </div>
      )}

      {/* Providers Tab */}
      {tab === "providers" && (
        <Section title="LLM Providers">
          <p className="text-xs text-muted-foreground mb-4">
            Overrides <code className="bg-muted px-1 rounded">LLM_*</code> env vars. Tried in order — preferred modality first.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="pb-2 pr-3 font-medium w-[34%]">Base URL</th>
                  <th className="pb-2 pr-3 font-medium w-[22%]">Model</th>
                  <th className="pb-2 pr-3 font-medium w-[22%]">API Key</th>
                  <th className="pb-2 pr-3 font-medium text-center w-[8%]">Text</th>
                  <th className="pb-2 pr-3 font-medium text-center w-[8%]">Image</th>
                  <th className="pb-2 font-medium w-[6%]" />
                </tr>
              </thead>
              <tbody>
                {providers.map((p, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={p.base_url}
                        onChange={(e) => updateProvider(i, { base_url: e.target.value })}
                        placeholder="https://api.openai.com/v1"
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={p.model}
                        onChange={(e) => updateProvider(i, { model: e.target.value })}
                        placeholder="gpt-4o"
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="password"
                        value={p.api_key}
                        onChange={(e) => updateProvider(i, { api_key: e.target.value })}
                        placeholder="sk-…"
                        className="w-full rounded border border-input bg-background px-2 py-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      />
                    </td>
                    <td className="py-2 pr-3 text-center">
                      <input
                        type="checkbox"
                        checked={p.supports_text}
                        onChange={(e) => updateProvider(i, { supports_text: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-2 pr-3 text-center">
                      <input
                        type="checkbox"
                        checked={p.supports_image}
                        onChange={(e) => updateProvider(i, { supports_image: e.target.checked })}
                        className="w-4 h-4 accent-primary cursor-pointer"
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removeProvider(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors text-xs px-1"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" onClick={addProvider}>+ Add provider</Button>
            <Button size="sm" onClick={saveProviders}>Save all providers</Button>
            <Button size="sm" variant="destructive" onClick={() => resetField("llm_providers")}>Reset to env defaults</Button>
          </div>
        </Section>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg animate-in slide-in-from-right-4",
              t.type === "success" && "bg-green-600",
              t.type === "error" && "bg-red-600",
              t.type === "info" && "bg-primary"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</p>
      )}
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 last:mb-0">
      {label && <label className="block text-sm text-muted-foreground mb-1.5">{label}</label>}
      {children}
    </div>
  );
}

function FieldRow({
  value,
  onChange,
  onSave,
  onReset,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        style={type === "number" ? { maxWidth: 120 } : undefined}
      />
      <Button size="sm" onClick={onSave}>Save</Button>
      <Button size="sm" variant="outline" onClick={onReset}>Reset</Button>
    </div>
  );
}
