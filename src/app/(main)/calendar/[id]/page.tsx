"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Plus, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventList } from "@/components/calendar/EventList";
import { EventForm } from "@/components/calendar/EventForm";
import { CalendarReadme } from "@/components/calendar/CalendarReadme";
import { useCalendar, useUpdateCalendar } from "@/hooks/use-calendars";
import { useCalendarEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from "@/hooks/use-calendar-events";
import { useSelectedUser } from "@/context/user-context";
import { useContacts } from "@/hooks/use-contacts";
import { useTasks } from "@/hooks/use-tasks";
import type { CalendarEvent } from "@/types/api";

type FormMode = "create" | "edit" | null;

export default function CalendarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { selectedUserId } = useSelectedUser();
  const currentUserId = selectedUserId ?? "api-user";

  const { data: calendar, isLoading: calLoading } = useCalendar(id, currentUserId);
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents(id, { callerId: currentUserId });
  const { data: contacts = [] } = useContacts();
  const { data: tasks = [] } = useTasks(currentUserId);

  const createEvent = useCreateEvent(id);
  const updateEvent = useUpdateEvent(id);
  const deleteEvent = useDeleteEvent(id);
  const updateCalendar = useUpdateCalendar(currentUserId);

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  if (calLoading) return <div className="p-6 text-muted-foreground text-sm">Loading…</div>;
  if (!calendar) return <div className="p-6 text-muted-foreground text-sm">Calendar not found or you don&apos;t have access.</div>;

  const myPerm = calendar.permissions.find((p) => p.user_id === currentUserId);
  const isAdmin = calendar.owner_id === currentUserId || myPerm?.role === "admin";
  const isEditor = isAdmin || myPerm?.role === "editor";

  const contactNames: Record<string, string> = Object.fromEntries(contacts.map((c) => [c.canonical_id, c.name]));

  // Tasks with due dates for the unified view
  const tasksWithDue = tasks.filter((t) => t.due_date && t.status !== "done");

  async function handleSaveEvent(data: {
    title: string; description: string; start_time: string; end_time: string | undefined;
    location: string; all_day: boolean; visibility: "private" | "shared";
  }) {
    if (formMode === "create") {
      await createEvent.mutateAsync({ ...data, created_by: currentUserId });
    } else if (formMode === "edit" && editingEvent) {
      await updateEvent.mutateAsync({
        eventId: editingEvent.id,
        caller_id: currentUserId,
        ...data,
        clear_end_time: !data.end_time,
      });
    }
    setFormMode(null);
    setEditingEvent(null);
  }

  async function handleDeleteEvent(event: CalendarEvent) {
    await deleteEvent.mutateAsync({ eventId: event.id, callerId: currentUserId });
  }

  function handleEditEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setFormMode("edit");
  }

  async function handleSaveReadme(description: string) {
    await updateCalendar.mutateAsync({ id: calendar!.id, description });
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/calendar" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="h-3 w-3 rounded-full shrink-0" style={{ background: calendar.color }} />
          <h1 className="text-xl font-bold truncate">{calendar.name}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEditor && (
            <Button size="sm" onClick={() => setFormMode("create")}>
              <Plus className="h-4 w-4 mr-1" />
              Add event
            </Button>
          )}
          {isAdmin && (
            <Link href={`/calendar/${id}/settings`}>
              <Button size="sm" variant="outline">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <CalendarReadme
          description={calendar.description}
          canEdit={isAdmin}
          onSave={handleSaveReadme}
          saving={updateCalendar.isPending}
        />

        <EventList
          events={events}
          tasks={tasksWithDue}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
          contactNames={contactNames}
        />
      </div>

      {(formMode === "create" || formMode === "edit") && (
        <EventForm
          initial={editingEvent ?? undefined}
          onSave={handleSaveEvent}
          onClose={() => { setFormMode(null); setEditingEvent(null); }}
          loading={createEvent.isPending || updateEvent.isPending}
        />
      )}
    </div>
  );
}
