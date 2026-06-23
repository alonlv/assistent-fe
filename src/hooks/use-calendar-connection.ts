"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/** Whether the user has connected their real Google / Apple calendar. */
export function useCalendarConnection(userId?: string) {
  return useQuery({
    queryKey: ["calendar-connection", userId ?? null],
    queryFn: () => api.calendars.connectionStatus(userId),
  });
}
