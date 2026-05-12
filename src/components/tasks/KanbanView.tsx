"use client";

import type { Task, TaskStatus } from "@/types/api";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDueDate,
  isOverdue,
  nextPriority,
} from "@/lib/task-utils";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

function KanbanCard({ task }: { task: Task }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const dueLabel = formatDueDate(task.due_date);
  const overdue = isOverdue(task.due_date) && task.status !== "done";

  const nextStatus =
    task.status === "todo" ? "in_progress" : task.status === "in_progress" ? "done" : null;

  return (
    <div className="rounded-lg border border-border bg-card p-3 shadow-sm group flex flex-col gap-2">
      <div className="flex items-start justify-between gap-1">
        <p className={cn("text-sm font-medium leading-snug flex-1", task.status === "done" && "line-through text-muted-foreground")}>
          {task.title}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
          onClick={() => deleteTask.mutate(task.id)}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Priority dot */}
          <button
            title="Click to change priority"
            onClick={() => updateTask.mutate({ id: task.id, priority: nextPriority(task.priority) })}
            className={cn("h-2 w-2 rounded-full transition-transform hover:scale-125", {
              "bg-muted-foreground/30": task.priority === "none",
              "bg-blue-500": task.priority === "low",
              "bg-yellow-500": task.priority === "medium",
              "bg-red-500": task.priority === "high",
            })}
          />
          {dueLabel && (
            <span className={cn("text-xs flex items-center gap-0.5", overdue ? "text-red-500" : "text-muted-foreground")}>
              <Calendar className="h-3 w-3" />
              {dueLabel}
            </span>
          )}
        </div>

        {nextStatus && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100"
            onClick={() => updateTask.mutate({ id: task.id, status: nextStatus })}
          >
            {STATUS_LABELS[nextStatus]}
            <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>

      {(task.owner_id || task.user_id || task.owner_id) && (
        <p
          className="text-xs text-muted-foreground/40 truncate text-right"
          title={task.owner_id || task.user_id || task.owner_id}
        >
          {(task.owner_id || task.user_id || task.owner_id || "").replace(/^person:/, "")}
        </p>
      )}
    </div>
  );
}

export function KanbanView({ tasks }: { tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {COLUMNS.map((status) => {
        const col = tasks.filter((t) => t.status === status);
        return (
          <div key={status} className="flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <span className={cn("text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-full", STATUS_COLORS[status])}>
                {STATUS_LABELS[status]}
              </span>
              <span className="text-xs text-muted-foreground">{col.length}</span>
            </div>
            <div className="flex flex-col gap-2 min-h-[120px]">
              {col.length === 0 ? (
                <p className="text-xs text-muted-foreground/60 text-center py-6">Empty</p>
              ) : (
                col.map((task) => <KanbanCard key={task.id} task={task} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
