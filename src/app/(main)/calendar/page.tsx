"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendars, useCreateCalendar } from "@/hooks/use-calendars";
import { useSelectedUser } from "@/context/user-context";
import { useContacts } from "@/hooks/use-contacts";
import { cn } from "@/lib/utils";

export default function CalendarIndexPage() {
  const { selectedUserId } = useSelectedUser();
  const { data: calendars = [], isLoading } = useCalendars(selectedUserId ?? undefined);
  const { data: contacts = [] } = useContacts();
  const createCalendar = useCreateCalendar();

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#6366f1");

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    await createCalendar.mutateAsync({
      name,
      color: newColor,
      owner_id: selectedUserId ?? "api-user",
    });
    setNewName("");
    setCreating(false);
  }

  const myCalendars = calendars.filter((c) => c.owner_id === (selectedUserId ?? "api-user"));
  const sharedCalendars = calendars.filter((c) => c.owner_id !== (selectedUserId ?? "api-user"));

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendars</h1>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New calendar
        </Button>
      </div>

      {creating && (
        <div className="rounded-xl border border-border bg-card p-4 mb-6 space-y-3">
          <h2 className="font-medium text-sm">Create calendar</h2>
          <div className="flex gap-2">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); if (e.key === "Escape") setCreating(false); }}
              placeholder="Calendar name…"
              className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-9 rounded-md border border-input cursor-pointer" title="Calendar color" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => setCreating(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim() || createCalendar.isPending}>
              {createCalendar.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

      {myCalendars.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">My Calendars</h2>
          <div className="space-y-2">
            {myCalendars.map((cal) => (
              <Link
                key={cal.id}
                href={`/calendar/${cal.id}`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors group"
              >
                <span className="h-3 w-3 rounded-full shrink-0" style={{ background: cal.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{cal.name}</p>
                  {cal.description && <p className="text-xs text-muted-foreground truncate">{cal.description.slice(0, 80)}</p>}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {sharedCalendars.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shared with me</h2>
          <div className="space-y-2">
            {sharedCalendars.map((cal) => {
              const ownerContact = contacts.find((c) => c.canonical_id === cal.owner_id);
              return (
                <Link
                  key={cal.id}
                  href={`/calendar/${cal.id}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors group"
                >
                  <span className="h-3 w-3 rounded-full shrink-0" style={{ background: cal.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{cal.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ownerContact ? `by ${ownerContact.name}` : "Shared"}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isLoading && calendars.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm mb-1">No calendars yet</p>
          <Button size="sm" variant="outline" onClick={() => setCreating(true)}>Create your first calendar</Button>
        </div>
      )}
    </div>
  );
}
