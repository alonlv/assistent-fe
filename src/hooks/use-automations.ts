"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AutomationKind } from "@/types/api";

export function useAutomations(userId?: string, kind?: AutomationKind) {
  return useQuery({
    queryKey: ["automations", userId ?? null, kind ?? null],
    queryFn: () => api.automations.list(userId, kind),
  });
}
