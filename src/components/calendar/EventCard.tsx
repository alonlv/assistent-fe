"use client";

import { useState } from "react";
import { Clock, MapPin, Lock, Pencil, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/api";

interface Props {
  event: CalendarEvent;
  currentUserId: string;
  isAdmin?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  creatorName?: string;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function EventCard({ event, currentUserId, isAdmin, onEdit, onDelete, creatorName }: Props) {
  const canEdit = event.created_by === currentUserId || isAdmin;
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/40 transition-colors">
      <div className="flex flex-col items-center gap-0.5 min-w-[52px] text-center">
        {event.all_day ? (
          <span className="text-xs font-medium text-muted-foreground">All day</span>
        ) : (
          <>
            <span className="text-xs font-semibold">{fmt(event.start_time)}</span>
            {event.end_time && (
              <span className="text-[10px] text-muted-foreground">{fmt(event.end_time)}</span>
            )}
          </>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm leading-snug truncate">{event.title}</p>
          <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                title="Edit event"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {canEdit && onDelete && !confirming && (
              <button
                onClick={() => setConfirming(true)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete event"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {confirming && (
              <span className="flex items-center gap-1 text-xs text-destructive">
                Delete?
                <button onClick={() => onDelete?.(event)} className="underline font-medium">Yes</button>
                <button onClick={() => setConfirming(false)} className="underline">No</button>
              </span>
            )}
            {!canEdit && <span title="Created by someone else"><Lock className="h-3 w-3 text-muted-foreground" /></span>}
          </div>
        </div>

        {event.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {event.location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
          {event.visibility === "private" && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Private
            </span>
          )}
          {creatorName && event.created_by !== currentUserId && (
            <span className="text-xs text-muted-foreground">by {creatorName}</span>
          )}
        </div>
      </div>
    </div>
  );
}
