export interface BaseEntity {
  id: string;
  user_id: string;
  owner_id: string;
  context_id?: string;
  authorized_ids?: string[];
}

export interface Topic extends BaseEntity {
  name: string;
  color: string;
  created_at: string;
  authorized_ids: string[];
  note_count: number;
}

export interface Note extends BaseEntity {
  title: string;
  content: string;
  topic: string;
  created_at: string;
  updated_at: string;
}

export type Priority = "none" | "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task extends BaseEntity {
  title: string;
  done: boolean;
  status: TaskStatus;
  priority: Priority;
  tags?: string[];
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export type AutomationKind = "reminder" | "monitor";

export interface Automation extends BaseEntity {
  kind: AutomationKind;
  platform: string;
  channel_id: string;
  content: string;
  run_at: string | null;
  cron: string | null;
  last_run_at: string | null;
  snooze_count: number;
  awaiting_response: boolean;
}

export interface ContactIdentity {
  platform: string;
  id: string;
  label: string;
}

export interface Contact {
  name: string;
  canonical_id: string;
  identities: ContactIdentity[];
  primary_channel?: { platform: string; channel_id: string };
  attributes?: Record<string, unknown>;
}

export interface Memory {
  id: string;
  user_id?: string;
  owner_id?: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
  authorized_ids?: string[];
}

export type CalendarRole = "viewer" | "editor" | "admin";

export interface CalendarPermission {
  calendar_id: string;
  user_id: string;
  role: CalendarRole;
  granted_by: string;
  granted_at: string;
}

export interface Calendar {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  color: string;
  permissions: CalendarPermission[];
  created_at: string;
  updated_at: string;
}

export interface JobRun {
  job_name: string;
  started_at: string;
  status: "ok" | "error" | "skip";
  message: string | null;
  user_id: string | null;
  duration_ms: number | null;
}

export interface JobStatus {
  last_run: JobRun | null;
  recent: JobRun[];
  totals: { ok: number; error: number; skip: number };
}

export interface BackgroundStatusResponse {
  jobs: Record<string, JobStatus>;
}

export interface CalendarEvent {
  id: string;
  calendar_id: string;
  created_by: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string | null;
  all_day: boolean;
  location: string;
  visibility: "private" | "shared";
  attendees: string[];
  google_event_id: string | null;
  created_at: string;
  updated_at: string;
}
