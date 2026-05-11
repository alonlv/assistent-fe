import type { Note, Priority, Task, TaskStatus, Topic } from "@/types/api";

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    let message = String(res.status);
    try {
      const body = await res.json();
      message = body?.error ?? body?.detail ?? message;
    } catch { /* non-JSON error body */ }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  notes: {
    list: (topic?: string, userId?: string) => {
      const params = new URLSearchParams();
      if (topic) params.set("topic", topic);
      if (userId) params.set("user_id", userId);
      const qs = params.toString();
      return apiFetch<Note[]>(`/api/notes${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) =>
      apiFetch<Note>(`/api/notes/${encodeURIComponent(id)}`),
    create: (body: { content?: string; topic: string; title?: string; user_id?: string }) =>
      apiFetch<Note>("/api/notes", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{ title: string; content: string; topic: string; user_id: string; authorized_ids: string[] }>) =>
      apiFetch<Note>(`/api/notes/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/notes/${encodeURIComponent(id)}`, { method: "DELETE" }),
  },
  tasks: {
    list: (userId?: string) => apiFetch<Task[]>(`/api/tasks${userId ? `?user_id=${encodeURIComponent(userId)}` : ""}`),
    create: (body: { title: string; status?: TaskStatus; priority?: Priority; due_date?: string; user_id?: string }) =>
      apiFetch<Task>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (
      id: string,
      body: Partial<{
        title: string;
        done: boolean;
        status: TaskStatus;
        priority: Priority;
        due_date: string;
        clear_due_date: boolean;
        user_id: string;
        authorized_ids: string[];
      }>
    ) => apiFetch<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
  topics: {
    list: () => apiFetch<Topic[]>("/api/topics"),
    create: (body: { name: string; color?: string }) =>
      apiFetch<Topic>("/api/topics", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{ name: string; color: string; user_id: string; authorized_ids: string[] }>) =>
      apiFetch<Topic>(`/api/topics/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string, migrateToId?: string) =>
      apiFetch<void>(
        `/api/topics/${id}${migrateToId ? `?migrate_to=${encodeURIComponent(migrateToId)}` : ""}`,
        { method: "DELETE" }
      ),
  },
};
