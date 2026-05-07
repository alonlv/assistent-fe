"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, Save, Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LlmProvider {
  base_url: string;
  model: string;
  api_key: string;
  supports_text: boolean;
  supports_image: boolean;
  supports_voice: boolean;
  role: "user" | "background" | "any";
  voice_model: string;
  timeout_seconds: number;
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

const DEFAULT_PROVIDER: LlmProvider = {
  base_url: "",
  model: "",
  api_key: "",
  supports_text: true,
  supports_image: false,
  supports_voice: false,
  role: "user",
  voice_model: "whisper-1",
  timeout_seconds: 60,
};

// ─── API helpers ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.detail ?? body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let _toastId = 0;
function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);
  return { toasts, toast: add };
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("general");
  const [config, setConfig] = useState<Config | null>(null);
  const [defaults, setDefaults] = useState<Partial<Config>>({});
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { toasts, toast } = useToasts();
  const dragIdx = useRef<number | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  const loadConfig = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [cfgRes, defsRes] = await Promise.all([
        apiFetch<{ effective: Config }>("/api/admin/config"),
        apiFetch<Partial<Config>>("/api/admin/config/defaults"),
      ]);
      setConfig(cfgRes.effective);
      setProviders(
        (cfgRes.effective.llm_providers ?? []).map((p) => ({ ...DEFAULT_PROVIDER, ...p }))
      );
      setDefaults(defsRes);
    } catch (e) {
      setFetchError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); }, [loadConfig]);

  // Cmd+S → save current tab
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (tab === "providers") saveProviders();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, providers]);

  // ── Mutations ─────────────────────────────────────────────────────────────

  async function saveField(key: keyof Config, value: unknown) {
    try {
      await apiFetch("/api/admin/config", { method: "PUT", body: JSON.stringify({ [key]: value }) });
      setConfig((prev) => prev ? { ...prev, [key]: value } : prev);
      toast(`Saved`, "success");
    } catch (e) { toast((e as Error).message, "error"); }
  }

  async function resetField(key: keyof Config) {
    try {
      await apiFetch(`/api/admin/config/${key}`, { method: "DELETE" });
      toast(`Reset to default`, "info");
      await loadConfig();
    } catch (e) { toast((e as Error).message, "error"); }
  }

  async function saveProviders() {
    const valid = providers.filter((p) => p.base_url && p.model && p.api_key);
    if (!valid.length) { toast("No valid providers — fill in Base URL, Model and API Key", "error"); return; }
    await saveField("llm_providers", valid);
  }

  // ── Provider helpers ──────────────────────────────────────────────────────

  function updateProvider(idx: number, patch: Partial<LlmProvider>) {
    setProviders((prev) => prev.map((p, i) => i === idx ? { ...p, ...patch } : p));
  }

  function addProvider() {
    setProviders((prev) => [...prev, { ...DEFAULT_PROVIDER }]);
  }

  function removeProvider(idx: number) {
    setProviders((prev) => prev.filter((_, i) => i !== idx));
  }

  // drag-to-reorder
  function onDragStart(idx: number) { dragIdx.current = idx; }
  function onDrop(targetIdx: number) {
    if (dragIdx.current === null || dragIdx.current === targetIdx) return;
    setProviders((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current!, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
    dragIdx.current = null;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-xl mx-auto mt-12 px-4 space-y-3">
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3">
          {fetchError}
        </p>
        <Button variant="outline" onClick={loadConfig}>Retry</Button>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold">Admin</h1>
        <Button variant="outline" size="sm" onClick={loadConfig}>
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-border mb-6">
        {(["general", "prompt", "providers"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px",
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── General ─────────────────────────────────────────────────────── */}
      {tab === "general" && (
        <div className="space-y-5">
          <Card title="Agent Identity">
            <SaveRow
              label="Agent Name"
              hint="Used in prompts and replies"
              value={config.agent_name}
              onChange={(v) => setConfig({ ...config, agent_name: v })}
              onSave={() => saveField("agent_name", config.agent_name)}
              onReset={() => resetField("agent_name")}
              placeholder="e.g. Alexander"
            />
            <SaveRow
              label="Timezone"
              hint="IANA identifier — used for reminders and date math"
              value={config.agent_timezone}
              onChange={(v) => setConfig({ ...config, agent_timezone: v })}
              onSave={() => saveField("agent_timezone", config.agent_timezone)}
              onReset={() => resetField("agent_timezone")}
              placeholder="e.g. Asia/Jerusalem"
            />
            <SaveRow
              label="Max Tool Rounds"
              hint="Max LLM tool-call loops per message before giving up"
              value={String(config.agent_max_tool_rounds)}
              onChange={(v) => setConfig({ ...config, agent_max_tool_rounds: parseInt(v) || 1 })}
              onSave={() => saveField("agent_max_tool_rounds", config.agent_max_tool_rounds)}
              onReset={() => resetField("agent_max_tool_rounds")}
              type="number"
              inputProps={{ min: 1, max: 50 }}
            />
            <div className="flex items-start justify-between gap-4 pt-1">
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="verbose"
                    checked={config.agent_verbose_responses}
                    onChange={(e) => setConfig({ ...config, agent_verbose_responses: e.target.checked })}
                    className="w-4 h-4 cursor-pointer accent-primary"
                  />
                  <label htmlFor="verbose" className="text-sm font-medium cursor-pointer">
                    Verbose responses
                  </label>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 ml-6">
                  Show internal IDs and category names in replies
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" onClick={() => saveField("agent_verbose_responses", config.agent_verbose_responses)}>
                  <Save className="h-3.5 w-3.5 mr-1" />Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => resetField("agent_verbose_responses")}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>

          <Card title="Meeting Organizer">
            <SaveRow
              label="Organizer Name"
              hint="Shown as the meeting organizer in calendar invites"
              value={config.organizer_name}
              onChange={(v) => setConfig({ ...config, organizer_name: v })}
              onSave={() => saveField("organizer_name", config.organizer_name)}
              onReset={() => resetField("organizer_name")}
              placeholder="Your full name"
            />
            <SaveRow
              label="Organizer Email"
              hint="Used as the organizer email in .ics files"
              value={config.organizer_email}
              onChange={(v) => setConfig({ ...config, organizer_email: v })}
              onSave={() => saveField("organizer_email", config.organizer_email)}
              onReset={() => resetField("organizer_email")}
              placeholder="you@example.com"
            />
          </Card>
        </div>
      )}

      {/* ── Prompt ──────────────────────────────────────────────────────── */}
      {tab === "prompt" && (
        <div className="space-y-5">
          {(
            [
              {
                key: "prompt_core" as const,
                label: "Core Behavior",
                hint: "Injected first in every system prompt. Sets the agent's personality and capabilities.",
                vars: [
                  { name: "{agent_name}", resolved: config.agent_name, desc: "Agent's display name" },
                  { name: "{agent_timezone}", resolved: config.agent_timezone, desc: "IANA timezone for date/time math" },
                ],
                position: "① First section",
              },
              {
                key: "prompt_memory" as const,
                label: "Memory Rules",
                hint: "Controls when the agent stores and retrieves long-term memories.",
                vars: [],
                position: "② Second section",
              },
              {
                key: "prompt_proactive" as const,
                label: "Proactive Tasks",
                hint: "Instructions for background intelligence tasks that run without a user prompt.",
                vars: [],
                position: "③ Third section",
              },
              {
                key: "prompt_notes" as const,
                label: "Notes Guidelines",
                hint: "Controls how the agent creates and formats notes and tasks.",
                vars: [],
                position: "④ Fourth section",
              },
            ] as const
          ).map(({ key, label, hint, vars, position }) => (
            <PromptCard
              key={key}
              label={label}
              hint={hint}
              vars={vars as unknown as PromptVar[]}
              position={position}
              value={config[key]}
              defaultValue={(defaults[key] as string) ?? ""}
              onChange={(v) => setConfig({ ...config, [key]: v })}
              onSave={() => saveField(key, config[key])}
              onReset={async () => {
                try {
                  await apiFetch(`/api/admin/config/${key}`, { method: "DELETE" });
                  setConfig((prev) =>
                    prev ? { ...prev, [key]: (defaults[key] as string) ?? "" } : prev
                  );
                  toast("Reset to default", "info");
                } catch (e) {
                  toast((e as Error).message, "error");
                }
              }}
            />
          ))}
        </div>
      )}

      {/* ── Providers ───────────────────────────────────────────────────── */}
      {tab === "providers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Overrides <code className="bg-muted px-1 rounded">LLM_*</code> env vars.
              Tried in order — drag to reorder. <kbd className="bg-muted px-1 rounded text-[10px]">⌘S</kbd> to save.
            </p>
            <Button size="sm" variant="outline" onClick={() => resetField("llm_providers")}>
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset to env
            </Button>
          </div>

          <div className="space-y-3">
            {providers.map((p, i) => (
              <ProviderCard
                key={i}
                idx={i}
                provider={p}
                onChange={(patch) => updateProvider(i, patch)}
                onRemove={() => removeProvider(i)}
                onDragStart={() => onDragStart(i)}
                onDrop={() => onDrop(i)}
              />
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button size="sm" variant="outline" onClick={addProvider}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add provider
            </Button>
            <Button size="sm" onClick={saveProviders}>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save all providers
            </Button>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "px-4 py-2.5 rounded-lg text-sm font-medium text-white shadow-lg",
              t.type === "success" && "bg-green-600",
              t.type === "error" && "bg-destructive",
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

// ─── Provider card ────────────────────────────────────────────────────────────

function ProviderCard({
  idx,
  provider: p,
  onChange,
  onRemove,
  onDragStart,
  onDrop,
}: {
  idx: number;
  provider: LlmProvider;
  onChange: (patch: Partial<LlmProvider>) => void;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="rounded-lg border border-border bg-card"
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0 w-4">
          {idx + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {p.model || <span className="text-muted-foreground italic">Unnamed provider</span>}
          </p>
          {p.base_url && (
            <p className="text-xs text-muted-foreground truncate">{p.base_url}</p>
          )}
        </div>
        <RoleBadge role={p.role} />
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Main fields — always visible */}
      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LabeledInput
            label="Base URL"
            value={p.base_url}
            onChange={(v) => onChange({ base_url: v })}
            placeholder="https://api.openai.com/v1"
          />
          <LabeledInput
            label="Model"
            value={p.model}
            onChange={(v) => onChange({ model: v })}
            placeholder="gpt-4o"
          />
        </div>
        <LabeledInput
          label="API Key"
          value={p.api_key}
          onChange={(v) => onChange({ api_key: v })}
          placeholder="sk-…"
          type="password"
        />

        {/* Modalities */}
        <div className="flex flex-wrap gap-5 pt-1">
          <Checkbox
            id={`text-${idx}`}
            label="Text"
            checked={p.supports_text}
            onChange={(v) => onChange({ supports_text: v })}
          />
          <Checkbox
            id={`image-${idx}`}
            label="Images"
            checked={p.supports_image}
            onChange={(v) => onChange({ supports_image: v })}
          />
          <Checkbox
            id={`voice-${idx}`}
            label="Voice / Whisper"
            checked={p.supports_voice}
            onChange={(v) => onChange({ supports_voice: v })}
          />
        </div>
      </div>

      {/* Advanced — collapsible */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-dashed border-border pt-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Advanced</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Role</label>
              <select
                value={p.role}
                onChange={(e) => onChange({ role: e.target.value as LlmProvider["role"] })}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="user">user — interactive requests only</option>
                <option value="background">background — async tasks only</option>
                <option value="any">any — both</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Controls which agent flows can use this provider.
              </p>
            </div>

            <LabeledInput
              label="Timeout (seconds)"
              value={String(p.timeout_seconds)}
              onChange={(v) => onChange({ timeout_seconds: parseFloat(v) || 60 })}
              type="number"
              inputProps={{ min: 5, max: 600, step: 5 }}
            />
          </div>

          {p.supports_voice && (
            <LabeledInput
              label="Voice Model"
              value={p.voice_model}
              onChange={(v) => onChange({ voice_model: v })}
              placeholder="whisper-1"
              hint='Whisper model name — only relevant when "Voice" is enabled'
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Prompt card ──────────────────────────────────────────────────────────────

interface PromptVar {
  name: string;
  resolved: string;
  desc: string;
}

function PromptCard({
  label,
  hint,
  vars,
  position,
  value,
  defaultValue,
  onChange,
  onSave,
  onReset,
}: {
  label: string;
  hint: string;
  vars: PromptVar[];
  position: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
}) {
  const isDirty = value !== defaultValue && defaultValue !== "";

  function insertAtCursor(e: React.MouseEvent<HTMLButtonElement>, snippet: string) {
    e.preventDefault();
    const ta = document.activeElement as HTMLTextAreaElement | null;
    if (ta && ta.tagName === "TEXTAREA") {
      const start = ta.selectionStart ?? value.length;
      const end = ta.selectionEnd ?? value.length;
      const next = value.slice(0, start) + snippet + value.slice(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + snippet.length;
        ta.focus();
      });
    } else {
      onChange(value + snippet);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        {isDirty && (
          <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded font-medium">
            modified
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mb-3">{hint}</p>

      {/* Inline reference panel */}
      <div className="rounded-md bg-muted/50 border border-border px-3 py-2.5 mb-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Position</span>
          <span className="text-xs text-foreground font-mono">{position}</span>
          <span className="text-muted-foreground/40 text-xs">·</span>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Format</span>
          <span className="text-xs text-muted-foreground">plain text or Markdown</span>
        </div>

        {vars.length > 0 ? (
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Available placeholders — click to insert
            </p>
            <div className="flex flex-wrap gap-2">
              {vars.map((v) => (
                <button
                  key={v.name}
                  onMouseDown={(e) => insertAtCursor(e, v.name)}
                  className="group flex items-baseline gap-1.5 rounded border border-dashed border-border bg-background px-2 py-1 hover:border-primary hover:bg-primary/5 transition-colors text-left"
                >
                  <code className="text-xs font-mono text-primary group-hover:text-primary">{v.name}</code>
                  <span className="text-[10px] text-muted-foreground">→</span>
                  <span className="text-[10px] text-foreground font-medium">{v.resolved || "—"}</span>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline">({v.desc})</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No variable substitution in this section.</p>
        )}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-mono resize-y focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring leading-relaxed"
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-muted-foreground">{value.length} chars · {value.split("\n").length} lines</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset to default
          </Button>
          <Button size="sm" onClick={onSave}>
            <Save className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      {title && (
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider -mb-1">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}

function SaveRow({
  label,
  hint,
  value,
  onChange,
  onSave,
  onReset,
  placeholder,
  type = "text",
  inputProps,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onReset: () => void;
  placeholder?: string;
  type?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") onSave();
  }
  return (
    <div>
      <label className="block text-sm font-medium mb-0.5">{label}</label>
      {hint && <p className="text-xs text-muted-foreground mb-1.5">{hint}</p>}
      <div className="flex gap-2 items-center">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          placeholder={placeholder}
          className={cn(
            "rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            type === "number" ? "w-32" : "flex-1"
          )}
          {...inputProps}
        />
        <Button size="sm" onClick={onSave}>
          <Save className="h-3.5 w-3.5 mr-1" />Save
        </Button>
        <Button size="sm" variant="outline" onClick={onReset} title="Reset to default">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  inputProps,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        {...inputProps}
      />
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}

function Checkbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary cursor-pointer"
      />
      <span className="text-sm">{label}</span>
    </label>
  );
}

function RoleBadge({ role }: { role: LlmProvider["role"] }) {
  const colors: Record<LlmProvider["role"], string> = {
    user: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    background: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    any: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };
  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0", colors[role])}>
      {role}
    </span>
  );
}
