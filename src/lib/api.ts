import type { Note, Priority, Task, TaskStatus } from "@/types/api";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  notes: {
    list: (topic?: string) =>
      apiFetch<Note[]>(`/api/notes${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`),
    create: (body: { content?: string; topic: string; title?: string }) =>
      apiFetch<Note>("/api/notes", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Partial<{ title: string; content: string; topic: string }>) =>
      apiFetch<Note>(`/api/notes/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/notes/${id}`, { method: "DELETE" }),
  },
  tasks: {
    list: () => apiFetch<Task[]>("/api/tasks"),
    create: (body: { title: string; status?: TaskStatus; priority?: Priority; due_date?: string }) =>
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
      }>
    ) => apiFetch<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
  },
};
