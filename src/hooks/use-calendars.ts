"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { CalendarRole } from "@/types/api";

export function useCalendars(userId?: string) {
  return useQuery({
    queryKey: ["calendars", userId],
    queryFn: () => api.calendars.list(userId),
  });
}

export function useCalendar(id: string, userId?: string) {
  return useQuery({
    queryKey: ["calendar", id, userId],
    queryFn: () => api.calendars.get(id, userId),
    enabled: !!id,
  });
}

export function useCreateCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name: string; description?: string; color?: string; owner_id: string }) =>
      api.calendars.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendars"] }),
  });
}

export function useUpdateCalendar(callerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; name?: string; description?: string; color?: string }) =>
      api.calendars.update(id, body, callerId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["calendars"] });
      qc.invalidateQueries({ queryKey: ["calendar", vars.id] });
    },
  });
}

export function useDeleteCalendar(callerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.calendars.delete(id, callerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendars"] }),
  });
}

export function useCalendarPermissions(calendarId: string, callerId: string) {
  return useQuery({
    queryKey: ["calendar-permissions", calendarId],
    queryFn: () => api.calendars.getPermissions(calendarId, callerId),
    enabled: !!calendarId && !!callerId,
  });
}

export function useGrantPermission(calendarId: string, callerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { user_id: string; role: CalendarRole }) =>
      api.calendars.grantPermission(calendarId, callerId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-permissions", calendarId] }),
  });
}

export function useRevokePermission(calendarId: string, callerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.calendars.revokePermission(calendarId, userId, callerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["calendar-permissions", calendarId] }),
  });
}
