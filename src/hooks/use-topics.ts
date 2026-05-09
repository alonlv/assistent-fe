"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: api.topics.list,
    staleTime: 30_000,
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.topics.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useUpdateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<{ name: string; color: string; user_id: string; authorized_ids: string[] }>) =>
      api.topics.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, migrateToId }: { id: string; migrateToId?: string }) =>
      api.topics.delete(id, migrateToId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
