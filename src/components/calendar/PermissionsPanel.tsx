"use client";

import { useState } from "react";
import { Users, Trash2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCalendarPermissions, useGrantPermission, useRevokePermission } from "@/hooks/use-calendars";
import type { CalendarRole, Contact } from "@/types/api";

interface Props {
  calendarId: string;
  callerId: string;
  ownerId: string;
  contacts: Contact[];
}

const ROLE_LABELS: Record<CalendarRole, string> = {
  viewer: "Viewer",
  editor: "Editor",
  admin: "Admin",
};

const ROLE_DESC: Record<CalendarRole, string> = {
  viewer: "Can view events",
  editor: "Can add & edit own events",
  admin: "Full control",
};

export function PermissionsPanel({ calendarId, callerId, ownerId, contacts }: Props) {
  const { data: perms = [], isLoading } = useCalendarPermissions(calendarId, callerId);
  const grant = useGrantPermission(calendarId, callerId);
  const revoke = useRevokePermission(calendarId, callerId);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<CalendarRole>("editor");
  const [adding, setAdding] = useState(false);

  const existingUserIds = new Set(perms.map((p) => p.user_id));
  existingUserIds.add(ownerId);
  const availableContacts = contacts.filter((c) => !existingUserIds.has(c.canonical_id));

  async function handleGrant() {
    if (!selectedUserId) return;
    await grant.mutateAsync({ user_id: selectedUserId, role: selectedRole });
    setSelectedUserId("");
    setAdding(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Users className="h-3.5 w-3.5" />
          Members
        </div>
        {callerId === ownerId && (
          <Button size="sm" variant="outline" onClick={() => setAdding(!adding)}>
            Add member
          </Button>
        )}
      </div>

      {adding && (
        <div className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs text-muted-foreground mb-1">Person</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">Select contact…</option>
              {availableContacts.map((c) => (
                <option key={c.canonical_id} value={c.canonical_id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as CalendarRole)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              {(["viewer", "editor", "admin"] as CalendarRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]} — {ROLE_DESC[r]}</option>
              ))}
            </select>
          </div>
          <Button size="sm" onClick={handleGrant} disabled={!selectedUserId || grant.isPending}>
            {grant.isPending ? "Granting…" : "Grant"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
        </div>
      )}

      <div className="space-y-2">
        {/* Owner row */}
        <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
          <Crown className="h-4 w-4 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {contacts.find((c) => c.canonical_id === ownerId)?.name ?? ownerId}
            </p>
            <p className="text-xs text-muted-foreground">Owner</p>
          </div>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground px-1">Loading…</p>}

        {perms.map((p) => {
          const contact = contacts.find((c) => c.canonical_id === p.user_id);
          return (
            <div key={p.user_id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
              <div className="h-4 w-4 rounded-full bg-muted shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{contact?.name ?? p.user_id}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[p.role as CalendarRole]}</p>
              </div>
              {callerId === ownerId && (
                <div className="flex items-center gap-1 shrink-0">
                  <select
                    value={p.role}
                    onChange={(e) => grant.mutate({ user_id: p.user_id, role: e.target.value as CalendarRole })}
                    className="h-7 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {(["viewer", "editor", "admin"] as CalendarRole[]).map((r) => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => revoke.mutate(p.user_id)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Remove access"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
