"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Zap, Clock, RefreshCw, AlertCircle, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Md } from "@/components/ui/md";
import {
  ScheduledItemForm,
  scheduledFormToPayload,
  scheduledItemToForm,
  formatItemSchedule,
  type ScheduledFormState,
  EMPTY_SCHEDULED_FORM,
} from "@/components/ui/ScheduledItemForm";
import type { ProactiveTask } from "@/types/api";
import { useContacts } from "@/hooks/use-contacts";
import { useSelectedUser } from "@/context/user-context";
import { Users } from "lucide-react";

const EMPTY_MONITOR_FORM: ScheduledFormState = { ...EMPTY_SCHEDULED_FORM, scheduleType: "cron" };

export default function ProactiveTasksPage() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { data: contacts = [] } = useContacts();
  const { selectedUserId, selectedUserName } = useSelectedUser();

  const { data: tasks = [], isLoading, error } = useQuery<ProactiveTask[]>({
    queryKey: ["proactive-tasks", selectedUserId],
    queryFn: () => fetch(`/api/proactive-tasks${selectedUserId ? `?user_id=${encodeURIComponent(selectedUserId)}` : ""}`).then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/proactive-tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["proactive-tasks"] }); setShowAdd(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      fetch(`/api/proactive-tasks/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["proactive-tasks"] }); setEditId(null); },
  });

  const del = useMutation({
    mutationFn: (id: string) => fetch(`/api/proactive-tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proactive-tasks"] }),
  });

  function toForm(t: ProactiveTask): ScheduledFormState {
    return scheduledItemToForm(t, t.instruction);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Monitors</h1>
          {selectedUserName && (
            <p className="text-xs text-primary mt-0.5">Viewing {selectedUserName}&apos;s monitors</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["proactive-tasks"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {selectedUserId && (
            <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); }}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load monitors.
        </div>
      )}

      {contacts.length > 0 && !selectedUserId && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0" />
          Select a profile from the sidebar to view and manage monitors.
        </div>
      )}

      {showAdd && selectedUserId && (
        <div className="mb-4">
          <ScheduledItemForm
            initial={EMPTY_MONITOR_FORM}
            textLabel="Instruction"
            textPlaceholder="e.g. Send me a daily task summary at 9am"
            onSave={(f) => create.mutate(scheduledFormToPayload(f, "instruction", selectedUserId))}
            onCancel={() => setShowAdd(false)}
            saving={create.isPending}
            contacts={contacts}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : tasks.length === 0 && !showAdd ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active monitors.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) =>
            editId === t.id ? (
              <ScheduledItemForm
                key={t.id}
                initial={toForm(t)}
                textLabel="Instruction"
                textPlaceholder="e.g. Send me a daily task summary at 9am"
                onSave={(f) => update.mutate({ id: t.id, body: scheduledFormToPayload(f, "instruction", selectedUserId) })}
                onCancel={() => setEditId(null)}
                saving={update.isPending}
                contacts={contacts}
              />
            ) : (
              <div key={t.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <Zap className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Md className="text-sm">{t.instruction}</Md>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatItemSchedule(t)}
                    </span>
                    {t.last_run_at && (
                      <span className="opacity-60">Last ran {new Date(t.last_run_at).toLocaleString()}</span>
                    )}
                    {(() => {
                      const ids = t.authorized_ids?.length ? t.authorized_ids : (t.owner_id || t.user_id) ? [t.owner_id || t.user_id] : [];
                      if (!ids.length) return null;
                      const names = ids.map((id) => contacts.find((c) => c.canonical_id === id)?.name ?? id.replace(/^person:/, ""));
                      return <span className="opacity-50 truncate">{names.join(", ")}</span>;
                    })()}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => { setEditId(t.id); setShowAdd(false); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => del.mutate(t.id)} disabled={del.isPending}>
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
