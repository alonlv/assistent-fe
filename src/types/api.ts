export interface Topic {
  id: string;
  person_id: string;
  owner_id: string;
  name: string;
  color: string;
  created_at: string;
  authorized_ids: string[];
  note_count: number;
}

export interface Note {
  id: string;
  person_id: string;
  owner_id: string;
  title: string;
  content: string;
  topic: string;
  created_at: string;
  updated_at: string;
  context_id?: string;
  authorized_ids?: string[];
}

export type Priority = "none" | "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  person_id: string;
  owner_id: string;
  title: string;
  done: boolean;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  context_id?: string;
  authorized_ids?: string[];
}

export interface Reminder {
  id: string;
  person_id: string;
  owner_id: string;
  user_id: string;
  platform: string;
  channel_id: string;
  message: string;
  run_at: string | null;
  cron: string | null;
  context_id?: string;
  authorized_ids?: string[];
}

export interface ProactiveTask {
  id: string;
  person_id: string;
  owner_id: string;
  user_id: string;
  platform: string;
  channel_id: string;
  instruction: string;
  run_at: string | null;
  cron: string | null;
  last_run_at: string | null;
  context_id?: string;
  authorized_ids?: string[];
}

export interface Memory {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}
