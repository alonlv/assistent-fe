import type { Automation, AutomationKind, BackgroundStatusResponse, Calendar, CalendarEvent, CalendarPermission, CalendarRole, Note, Priority, Task, TaskStatus, Topic } from "@/types/api";

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

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
    list: (userId?: string, tag?: string) => {
      const params = new URLSearchParams();
      if (userId) params.set("user_id", userId);
      if (tag) params.set("tag", tag);
      const qs = params.toString();
      return apiFetch<Task[]>(`/api/tasks${qs ? `?${qs}` : ""}`);
    },
    create: (body: { title: string; status?: TaskStatus; priority?: Priority; tags?: string[]; due_date?: string; user_id?: string }) =>
      apiFetch<Task>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
    update: (
      id: string,
      body: Partial<{
        title: string;
        done: boolean;
        status: TaskStatus;
        priority: Priority;
        tags: string[];
        due_date: string;
        clear_due_date: boolean;
        user_id: string;
        authorized_ids: string[];
      }>
    ) => apiFetch<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) =>
      apiFetch<void>(`/api/tasks/${id}`, { method: "DELETE" }),
    listTags: () => apiFetch<string[]>("/api/tasks/tags"),
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
  calendars: {
    list: (userId?: string) => {
      const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
      return apiFetch<Calendar[]>(`/api/calendars${qs}`);
    },
    get: (id: string, userId?: string) => {
      const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
      return apiFetch<Calendar>(`/api/calendars/${id}${qs}`);
    },
    create: (body: { name: string; description?: string; color?: string; owner_id: string }) =>
      apiFetch<Calendar>("/api/calendars", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: { name?: string; description?: string; color?: string }, callerId: string) =>
      apiFetch<Calendar>(`/api/calendars/${id}?caller_id=${encodeURIComponent(callerId)}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string, callerId: string) =>
      apiFetch<void>(`/api/calendars/${id}?caller_id=${encodeURIComponent(callerId)}`, { method: "DELETE" }),
    getPermissions: (id: string, callerId: string) =>
      apiFetch<CalendarPermission[]>(`/api/calendars/${id}/permissions?caller_id=${encodeURIComponent(callerId)}`),
    grantPermission: (id: string, callerId: string, body: { user_id: string; role: CalendarRole }) =>
      apiFetch<CalendarPermission>(`/api/calendars/${id}/permissions?caller_id=${encodeURIComponent(callerId)}`, { method: "POST", body: JSON.stringify(body) }),
    updatePermission: (id: string, userId: string, callerId: string, body: { user_id: string; role: CalendarRole }) =>
      apiFetch<CalendarPermission>(`/api/calendars/${id}/permissions/${encodeURIComponent(userId)}?caller_id=${encodeURIComponent(callerId)}`, { method: "PUT", body: JSON.stringify(body) }),
    revokePermission: (id: string, userId: string, callerId: string) =>
      apiFetch<void>(`/api/calendars/${id}/permissions/${encodeURIComponent(userId)}?caller_id=${encodeURIComponent(callerId)}`, { method: "DELETE" }),
    listEvents: (id: string, opts?: { callerId?: string; from?: string; to?: string }) => {
      const params = new URLSearchParams();
      if (opts?.callerId) params.set("caller_id", opts.callerId);
      if (opts?.from) params.set("from_time", opts.from);
      if (opts?.to) params.set("to_time", opts.to);
      const qs = params.toString();
      return apiFetch<CalendarEvent[]>(`/api/calendars/${id}/events${qs ? `?${qs}` : ""}`);
    },
    createEvent: (id: string, body: { title: string; start_time: string; end_time?: string; description?: string; location?: string; all_day?: boolean; visibility?: "private" | "shared"; attendees?: string[]; remind_before_minutes?: number; created_by: string }) =>
      apiFetch<CalendarEvent>(`/api/calendars/${id}/events`, { method: "POST", body: JSON.stringify(body) }),
    updateEvent: (calendarId: string, eventId: string, body: { caller_id: string; title?: string; description?: string; start_time?: string; end_time?: string; clear_end_time?: boolean; location?: string; all_day?: boolean; visibility?: "private" | "shared" }) =>
      apiFetch<CalendarEvent>(`/api/calendars/${calendarId}/events/${eventId}`, { method: "PATCH", body: JSON.stringify(body) }),
    deleteEvent: (calendarId: string, eventId: string, callerId: string) =>
      apiFetch<void>(`/api/calendars/${calendarId}/events/${eventId}?caller_id=${encodeURIComponent(callerId)}`, { method: "DELETE" }),
  },
  automations: {
    list: (userId?: string, kind?: AutomationKind) => {
      const params = new URLSearchParams();
      if (userId) params.set("user_id", userId);
      if (kind) params.set("kind", kind);
      const qs = params.toString();
      return apiFetch<Automation[]>(`/api/automations${qs ? `?${qs}` : ""}`);
    },
  },
  backgroundStatus: {
    get: () => apiFetch<BackgroundStatusResponse>("/api/admin/background-status"),
  },
  chat: {
    send: (message: string, userId?: string) =>
      apiFetch<{ reply: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message, user_id: userId || "web-user" }),
      }),
    history: (userId?: string) => {
      const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
      return apiFetch<{ messages: ChatTurn[] }>(`/api/chat/history${qs}`);
    },
  },
};
