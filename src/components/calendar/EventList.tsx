"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { EventCard } from "./EventCard";
import type { CalendarEvent, Task } from "@/types/api";
import { cn } from "@/lib/utils";

interface Props {
  events: CalendarEvent[];
  tasks?: Task[];
  currentUserId: string;
  isAdmin?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  contactNames?: Record<string, string>;
}

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function fmtDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

export function EventList({ events, tasks = [], currentUserId, isAdmin, onEdit, onDelete, contactNames = {} }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, { events: CalendarEvent[]; tasks: Task[] }>();
    for (const e of events) {
      const key = dayKey(e.start_time);
      if (!map.has(key)) map.set(key, { events: [], tasks: [] });
      map.get(key)!.events.push(e);
    }
    for (const t of tasks) {
      if (!t.due_date) continue;
      const key = dayKey(t.due_date);
      if (!map.has(key)) map.set(key, { events: [], tasks: [] });
      map.get(key)!.tasks.push(t);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [events, tasks]);

  if (grouped.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <CalendarDays className="h-10 w-10 mb-3 opacity-30" />
        <p className="text-sm">No events yet. Add the first one.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(([day, { events: dayEvents, tasks: dayTasks }]) => (
        <div key={day}>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
            {fmtDay(day)}
          </h3>
          <div className="space-y-2">
            {dayEvents.map((e) => (
              <EventCard
                key={e.id}
                event={e}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
                onEdit={onEdit}
                onDelete={onDelete}
                creatorName={contactNames[e.created_by]}
              />
            ))}
            {dayTasks.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "flex gap-3 rounded-lg border border-dashed border-border bg-muted/40 p-3",
                  t.status === "done" && "opacity-50"
                )}
              >
                <div className="flex flex-col items-center gap-0.5 min-w-[52px] text-center">
                  <span className="text-[10px] text-muted-foreground">Task</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-medium text-sm", t.status === "done" && "line-through")}>{t.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{t.status.replace("_", " ")} · {t.priority} priority</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
