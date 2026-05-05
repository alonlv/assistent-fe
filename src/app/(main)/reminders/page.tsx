"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Bell, Clock, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Reminder {
  id: string;
  message: string;
  platform: string;
  user_id: string;
  run_at: string | null;
  cron: string | null;
}

function formatSchedule(r: Reminder) {
  if (r.cron) return `Every: ${r.cron}`;
  if (r.run_at) return new Date(r.run_at).toLocaleString();
  return "—";
}

export default function RemindersPage() {
  const qc = useQueryClient();

  const { data: reminders = [], isLoading, error } = useQuery<Reminder[]>({
    queryKey: ["reminders"],
    queryFn: () => fetch("/api/reminders").then((r) => r.json()),
  });

  const del = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/reminders/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders"] }),
  });

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Button variant="ghost" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["reminders"] })}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load reminders.
        </div>
      )}

      <p className="text-xs text-muted-foreground mb-4">
        Create reminders by asking the agent — e.g. "Remind me to review PRs tomorrow at 10am".
      </p>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No active reminders.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((r) => (
            <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
              <Bell className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">{r.message}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatSchedule(r)}
                  </span>
                  <span className="capitalize opacity-60">{r.platform}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-red-600 shrink-0"
                onClick={() => del.mutate(r.id)}
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
