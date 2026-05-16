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
