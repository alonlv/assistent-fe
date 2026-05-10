"use client";

import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { TaskList } from "@/components/tasks/TaskList";
import { KanbanView } from "@/components/tasks/KanbanView";
import { AddTaskInput } from "@/components/tasks/AddTaskInput";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/api";
import { STATUS_LABELS } from "@/lib/task-utils";
import { useSelectedUser } from "@/context/user-context";

type View = "list" | "kanban";

const FILTERS: Array<{ label: string; value: TaskStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: STATUS_LABELS.todo, value: "todo" },
  { label: STATUS_LABELS.in_progress, value: "in_progress" },
  { label: STATUS_LABELS.done, value: "done" },
];

export default function TasksPage() {
  const { selectedUserId, selectedUserName } = useSelectedUser();
  const { data: tasks = [], isLoading, error: tasksError } = useTasks(selectedUserId ?? undefined);
  const [view, setView] = useState<View>("list");
  const [filter, setFilter] = useState<TaskStatus | "all">("all");

  const overdue = tasks.filter(
    (t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
  );

  const filtered = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          {selectedUserName && (
            <p className="text-xs text-primary mt-0.5">Viewing {selectedUserName}&apos;s tasks</p>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "kanban" ? "secondary" : "ghost"}
            size="icon"
            className="h-7 w-7"
            onClick={() => setView("kanban")}
            title="Board view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {tasksError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {tasksError.message}
        </div>
      )}

      {overdue.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {overdue.length} task{overdue.length > 1 ? "s" : ""} overdue
        </div>
      )}

      <div className="mb-4">
        <AddTaskInput />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {label}
            {value !== "all" && (
              <span className="ml-1 opacity-70">
                ({tasks.filter((t) => t.status === value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : view === "kanban" ? (
        <KanbanView tasks={filtered} />
      ) : (
        <TaskList tasks={filtered} showStatus={filter === "all"} />
      )}
    </div>
  );
}
