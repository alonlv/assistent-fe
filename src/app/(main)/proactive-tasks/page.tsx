"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Zap, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProactiveTask {
  id: string;
  instruction: string;
  platform: string;
  user_id: string;
  run_at: string | null;
  cron: string | null;
  last_run_at: string | null;
}

function formatSchedule(t: ProactiveTask) {
  if (t.cron) return `Every: ${t.cron}`;
  if (t.run_at) return new Date(t.run_at).toLocaleString();
  return "—";
}

export default function ProactiveTasksPage() {
  const qc = useQueryClient();

  const { data: tasks = [], isLoading, error } = useQuery<ProactiveTask[]>({
    queryKey: ["proactive-tasks"],
    queryFn: () => fetch("/api/proactive-tasks").then((r) => r.json()),
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/proactive-tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proactive-tasks"] }),
  });

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Monitors</h1>
        <Button variant="ghost" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["proactive-tasks"] })}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load monitors.
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-4">
        Create monitors by asking the agent — e.g. "Send me a daily task summary at 9am".
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Zap className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active monitors.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
              <Zap className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">{t.instruction}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatSchedule(t)}
                  </span>
                  {t.last_run_at && (
                    <span className="opacity-60">
                      Last ran {new Date(t.last_run_at).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-600 shrink-0"
                onClick={() => del.mutate(t.id)}
                disabled={del.isPending}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
