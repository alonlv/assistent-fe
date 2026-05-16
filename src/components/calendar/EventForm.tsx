"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { CalendarEvent } from "@/types/api";

interface Props {
  initial?: Partial<CalendarEvent>;
  onSave: (data: {
    title: string;
    description: string;
    start_time: string;
    end_time: string | undefined;
    location: string;
    all_day: boolean;
    visibility: "private" | "shared";
    attendees: string[];
    remind_before_minutes: number | undefined;
  }) => void;
  onClose: () => void;
  loading?: boolean;
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toLocalDate(iso: string) {
  return iso.slice(0, 10);
}

export function EventForm({ initial, onSave, onClose, loading }: Props) {
  const now = new Date();
  now.setSeconds(0, 0);
  const defaultStart = initial?.start_time ? toLocalInput(initial.start_time) : toLocalInput(now.toISOString());
  const endDefault = initial?.end_time ? toLocalInput(initial.end_time) : "";

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(endDefault);
  const [location, setLocation] = useState(initial?.location ?? "");
  const [allDay, setAllDay] = useState(initial?.all_day ?? false);
  const [visibility, setVisibility] = useState<"private" | "shared">(initial?.visibility ?? "shared");
  const [attendeeInput, setAttendeeInput] = useState("");
  const [attendees, setAttendees] = useState<string[]>(initial?.attendees ?? []);
  const [remindBefore, setRemindBefore] = useState<string>("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startTime) return;
    const toISO = (local: string) => new Date(local).toISOString();
    onSave({
      title: title.trim(),
      description: description.trim(),
      start_time: toISO(startTime),
      end_time: endTime ? toISO(endTime) : undefined,
      location: location.trim(),
      all_day: allDay,
      visibility,
      attendees,
      remind_before_minutes: remindBefore ? parseInt(remindBefore, 10) : undefined,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">{initial?.id ? "Edit Event" : "New Event"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="all-day"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="all-day" className="text-sm">All day</label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Start *</label>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={allDay ? startTime.slice(0, 10) : startTime}
                onChange={(e) => setStartTime(allDay ? e.target.value + "T00:00" : e.target.value)}
                required
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">End</label>
              <input
                type={allDay ? "date" : "datetime-local"}
                value={allDay && endTime ? endTime.slice(0, 10) : endTime}
                onChange={(e) => setEndTime(allDay ? e.target.value + "T00:00" : e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location"
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes…"
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as "private" | "shared")}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="shared">Shared — visible to all calendar members</option>
              <option value="private">Private — only visible to you</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Invite attendees (email)</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === ",") && attendeeInput.trim()) {
                    e.preventDefault();
                    if (!attendees.includes(attendeeInput.trim())) {
                      setAttendees([...attendees, attendeeInput.trim()]);
                    }
                    setAttendeeInput("");
                  }
                }}
                placeholder="email@example.com, press Enter to add"
                className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button type="button" size="sm" variant="outline" onClick={() => {
                if (attendeeInput.trim() && !attendees.includes(attendeeInput.trim())) {
                  setAttendees([...attendees, attendeeInput.trim()]);
                  setAttendeeInput("");
                }
              }}>Add</Button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {attendees.map((a) => (
                  <span key={a} className="flex items-center gap-1 text-xs bg-muted rounded-full px-2 py-0.5">
                    {a}
                    <button type="button" onClick={() => setAttendees(attendees.filter((x) => x !== a))} className="text-muted-foreground hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            )}
            {attendees.length > 0 && <p className="text-xs text-muted-foreground mt-1">Invites sent via Google Calendar when you save.</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Remind me before</label>
            <select
              value={remindBefore}
              onChange={(e) => setRemindBefore(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">No reminder</option>
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="120">2 hours before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" disabled={loading || !title.trim()}>
              {loading ? "Saving…" : initial?.id ? "Save changes" : "Create event"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
