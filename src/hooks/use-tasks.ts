"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Priority, Task, TaskStatus } from "@/types/api";

export function useTasks(userId?: string) {
  return useQuery({
    queryKey: ["tasks", userId ?? null],
    queryFn: () => api.tasks.list(userId),
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tasks", "tags"],
    queryFn: () => api.tasks.listTags(),
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { title: string; status?: TaskStatus; priority?: Priority; tags?: string[]; due_date?: string; user_id?: string }) =>
      api.tasks.create(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

type TaskUpdateArgs = { id: string } & Partial<{
  title: string;
  done: boolean;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  due_date: string;
  clear_due_date: boolean;
  user_id: string;
  authorized_ids: string[];
}>;

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: TaskUpdateArgs) => api.tasks.update(id, body),
    onMutate: async ({ id, done, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => {
          if (t.id !== id) return t;
          const newStatus = status ?? (done !== undefined ? (done ? "done" : "todo") : t.status);
          return { ...t, ...(status !== undefined && { status }), ...(done !== undefined && { done }), status: newStatus };
        }) ?? []
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.tasks.delete,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old) => old?.filter((t) => t.id !== id) ?? []);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks"], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
