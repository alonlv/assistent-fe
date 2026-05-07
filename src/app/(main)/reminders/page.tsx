"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Bell, Clock, RefreshCw, AlertCircle, Plus, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Md } from "@/components/ui/md";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  message: string;
  platform: string;
  user_id: string;
  channel_id: string;
  run_at: string | null;
  cron: string | null;
}

const PLATFORMS = ["telegram", "slack", "webex", "whatsapp"];

const EMPTY_FORM = {
  message: "",
  platform: "telegram",
  channel_id: "",
  scheduleType: "once" as "once" | "cron",
  run_at: "",
  cron: "",
};

type FormState = typeof EMPTY_FORM;

function ReminderForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormState;
  onSave: (f: FormState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [f, setF] = useState(initial);
  const set = (k: keyof FormState, v: string) => setF((p) => ({ ...p, [k]: v }));

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Message</label>
        <Input value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Reminder text…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Platform</label>
          <select
            value={f.platform}
            onChange={(e) => set("platform", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Channel / Chat ID</label>
          <Input value={f.channel_id} onChange={(e) => set("channel_id", e.target.value)} placeholder="e.g. 123456789" />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Schedule</label>
        <div className="flex gap-2 mb-2">
          {(["once", "cron"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("scheduleType", t)}
              className={cn(
                "text-xs px-3 py-1 rounded-full border transition-colors",
                f.scheduleType === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground"
              )}
            >
              {t === "once" ? "One-time" : "Recurring (cron)"}
            </button>
          ))}
        </div>
        {f.scheduleType === "once" ? (
          <Input type="datetime-local" value={f.run_at} onChange={(e) => set("run_at", e.target.value)} />
        ) : (
          <Input value={f.cron} onChange={(e) => set("cron", e.target.value)} placeholder="e.g. 0 9 * * 1-5" />
        )}
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(f)} disabled={saving || !f.message.trim()}>
          <Check className="h-3.5 w-3.5 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}

function formToPayload(f: FormState) {
  return {
    message: f.message,
    platform: f.platform,
    channel_id: f.channel_id,
    user_id: "web-user",
    run_at: f.scheduleType === "once" && f.run_at ? new Date(f.run_at).toISOString() : null,
    cron: f.scheduleType === "cron" && f.cron ? f.cron : null,
  };
}

function reminderToForm(r: Reminder): FormState {
  return {
    message: r.message,
    platform: r.platform,
    channel_id: r.channel_id,
    scheduleType: r.cron ? "cron" : "once",
    run_at: r.run_at ? new Date(r.run_at).toISOString().slice(0, 16) : "",
    cron: r.cron ?? "",
  };
}

function formatSchedule(r: Reminder) {
  if (r.cron) return `Every: ${r.cron}`;
  if (r.run_at) return new Date(r.run_at).toLocaleString();
  return "—";
}

export default function RemindersPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const { data: reminders = [], isLoading, error } = useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: () => fetch("/api/reminders").then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); setShowAdd(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      fetch(`/api/reminders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["reminders"] }); setEditId(null); },
  });

  const del = useMutation({
    mutationFn: (id: string) => fetch(`/api/reminders/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["reminders"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); }}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load reminders.
        </div>
      )}

      {showAdd && (
        <div className="mb-4">
          <ReminderForm
            initial={EMPTY_FORM}
            onSave={(f) => create.mutate(formToPayload(f))}
            onCancel={() => setShowAdd(false)}
            saving={create.isPending}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : reminders.length === 0 && !showAdd ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active reminders.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) =>
            editId === r.id ? (
              <ReminderForm
                key={r.id}
                initial={reminderToForm(r)}
                onSave={(f) => update.mutate({ id: r.id, body: formToPayload(f) })}
                onCancel={() => setEditId(null)}
                saving={update.isPending}
              />
            ) : (
              <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <Bell className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Md className="text-sm">{r.message}</Md>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatSchedule(r)}
                    </span>
                    <span className="capitalize opacity-60">{r.platform}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => { setEditId(r.id); setShowAdd(false); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => del.mutate(r.id)} disabled={del.isPending}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
