"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCalendarEvents(calendarId: string, opts?: { callerId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["calendar-events", calendarId, opts],
    queryFn: () => api.calendars.listEvents(calendarId, opts),
    enabled: !!calendarId,
  });
}

/** Today's events merged across all of the user's calendars, sorted by start time. */
export function useTodayAgenda(userId?: string) {
  return useQuery({
    queryKey: ["today-agenda", userId ?? null],
    queryFn: async () => {
      const cals = await api.calendars.list(userId);
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString();
      const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();
      const lists = await Promise.all(
        cals.map((c) => api.calendars.listEvents(c.id, { callerId: userId, from, to }).catch(() => [])),
      );
      const events = lists.flat();
      events.sort((a, b) => a.start_time.localeCompare(b.start_time));
      return events;
    },
  });
}

export function useCreateEvent(calendarId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      title: string;
      start_time: string;
      end_time?: string;
      description?: string;
      location?: string;
      all_day?: boolean;
      visibility?: "private" | "shared";
      attendees?: string[];
      remind_before_minutes?: number;
      created_by: string;
    }) => api.calendars.createEvent(calendarId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-events", calendarId] }),
  });
}

export function useUpdateEvent(calendarId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      ...body
    }: {
      eventId: string;
      caller_id: string;
      title?: string;
      description?: string;
      start_time?: string;
      end_time?: string;
      clear_end_time?: boolean;
      location?: string;
      all_day?: boolean;
      visibility?: "private" | "shared";
    }) => api.calendars.updateEvent(calendarId, eventId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-events", calendarId] }),
  });
}

export function useDeleteEvent(calendarId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, callerId }: { eventId: string; callerId: string }) =>
      api.calendars.deleteEvent(calendarId, eventId, callerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-events", calendarId] }),
  });
}
