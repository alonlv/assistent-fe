"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PermissionsPanel } from "@/components/calendar/PermissionsPanel";
import { useCalendar, useUpdateCalendar, useDeleteCalendar } from "@/hooks/use-calendars";
import { useSelectedUser } from "@/context/user-context";
import { useContacts } from "@/hooks/use-contacts";
import { useRouter } from "next/navigation";

export default function CalendarSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { selectedUserId } = useSelectedUser();
  const currentUserId = selectedUserId ?? "api-user";
  const router = useRouter();

  const { data: calendar, isLoading } = useCalendar(id, currentUserId);
  const { data: contacts = [] } = useContacts();
  const updateCalendar = useUpdateCalendar(currentUserId);
  const deleteCalendar = useDeleteCalendar(currentUserId);

  const [name, setName] = useState("");
  const [color, setColor] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (isLoading) return <div className="p-6 text-muted-foreground text-sm">Loading…</div>;
  if (!calendar) return <div className="p-6 text-muted-foreground text-sm">Calendar not found.</div>;

  const isOwner = calendar.owner_id === currentUserId;
  if (!isOwner) {
    return <div className="p-6 text-muted-foreground text-sm">Only the calendar owner can manage settings.</div>;
  }

  const displayName = name || calendar.name;
  const displayColor = color || calendar.color;

  async function handleSaveMeta() {
    await updateCalendar.mutateAsync({ id, name: displayName, color: displayColor });
  }

  async function handleDelete() {
    await deleteCalendar.mutateAsync(id);
    router.push("/calendar");
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href={`/calendar/${id}`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold">Calendar settings</h1>
      </div>

      {/* Meta */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <h2 className="font-medium text-sm">General</h2>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">Name</label>
            <input
              value={name || calendar.name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Color</label>
            <input
              type="color"
              value={color || calendar.color}
              onChange={(e) => setColor(e.target.value)}
              className="h-9 w-14 rounded-md border border-input cursor-pointer"
            />
          </div>
        </div>
        <Button size="sm" onClick={handleSaveMeta} disabled={updateCalendar.isPending}>
          {updateCalendar.isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Permissions */}
      <div className="rounded-xl border border-border bg-card p-4">
        <PermissionsPanel
          calendarId={id}
          callerId={currentUserId}
          ownerId={calendar.owner_id}
          contacts={contacts}
        />
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-destructive/40 bg-card p-4 space-y-3">
        <h2 className="font-medium text-sm text-destructive">Danger zone</h2>
        {!confirmDelete ? (
          <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete calendar
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This will permanently delete the calendar and all its events. Are you sure?</p>
            <div className="flex gap-2">
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteCalendar.isPending}>
                {deleteCalendar.isPending ? "Deleting…" : "Yes, delete"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
