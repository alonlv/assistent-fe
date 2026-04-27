export interface Topic {
  id: string;
  name: string;
  color: string;
  created_at: string;
  note_count: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  topic: string;
  created_at: string;
  updated_at: string;
}

export type Priority = "none" | "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  done: boolean;
  status: TaskStatus;
  priority: Priority;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}
