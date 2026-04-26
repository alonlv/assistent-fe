import type { Priority, TaskStatus } from "@/types/api";

export const PRIORITY_LABELS: Record<Priority, string> = {
  none: "No priority",
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  none: "text-muted-foreground",
  low: "text-blue-500",
  medium: "text-yellow-500",
  high: "text-red-500",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const PRIORITY_ORDER: Priority[] = ["none", "low", "medium", "high"];

export function nextPriority(current: Priority): Priority {
  const idx = PRIORITY_ORDER.indexOf(current);
  return PRIORITY_ORDER[(idx + 1) % PRIORITY_ORDER.length];
}

export function isOverdue(due_date: string | null): boolean {
  if (!due_date) return false;
  return new Date(due_date) < new Date();
}

export function formatDueDate(due_date: string | null): string | null {
  if (!due_date) return null;
  const d = new Date(due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff < 7) return `In ${diff}d`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
