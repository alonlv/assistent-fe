"use client";

import { useState } from "react";
import type { Task } from "@/types/api";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDueDate,
  isOverdue,
  nextPriority,
} from "@/lib/task-utils";
import type { TaskStatus } from "@/types/api";

const STATUS_CYCLE: TaskStatus[] = ["todo", "in_progress", "done"];

export function TaskItem({ task, showStatus = false }: { task: Task; showStatus?: boolean }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showDateInput, setShowDateInput] = useState(false);
  const dueLabel = formatDueDate(task.due_date);
  const overdue = isOverdue(task.due_date) && task.status !== "done";

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(task.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    updateTask.mutate({ id: task.id, status: next });
  }

  return (
    <div className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-accent/50 group">
      <input
        type="checkbox"
        checked={task.status === "done"}
        onChange={(e) =>
          updateTask.mutate({ id: task.id, status: e.target.checked ? "done" : "todo" })
        }
        className="mt-0.5 h-4 w-4 rounded border-border accent-primary cursor-pointer shrink-0"
      />

      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm block",
            task.status === "done" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>

        <div className="flex items-center flex-wrap gap-1.5 mt-1">
          {/* Priority dot — click to cycle */}
          <button
            title={PRIORITY_LABELS[task.priority]}
            onClick={() => updateTask.mutate({ id: task.id, priority: nextPriority(task.priority) })}
            className={cn("h-2 w-2 rounded-full transition-transform hover:scale-125 shrink-0", {
              "bg-muted-foreground/30": task.priority === "none",
              "bg-blue-500": task.priority === "low",
              "bg-yellow-500": task.priority === "medium",
              "bg-red-500": task.priority === "high",
            })}
          />

          {/* Status badge — click to cycle (only when not in kanban) */}
          {showStatus && (
            <button
              onClick={cycleStatus}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                STATUS_COLORS[task.status]
              )}
            >
              {STATUS_LABELS[task.status]}
            </button>
          )}

          {/* Due date */}
          {dueLabel && (
            <span
              className={cn(
                "flex items-center gap-0.5 text-xs",
                overdue ? "text-red-500 font-medium" : "text-muted-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              {dueLabel}
            </span>
          )}

          {/* Tags */}
          {(task.tags ?? []).length > 0 && (
            <div className="flex items-center gap-1">
              {(task.tags ?? []).slice(0, 5).map((tag) => (
                <span key={tag} className="text-xs bg-secondary px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Date picker trigger */}
          {showDateInput && (
            <input
              type="date"
              autoFocus
              className="text-xs border border-input rounded px-1 py-0.5"
              defaultValue={task.due_date ? task.due_date.split("T")[0] : ""}
              onBlur={(e) => {
                setShowDateInput(false);
                const val = e.target.value;
                if (val) updateTask.mutate({ id: task.id, due_date: new Date(val).toISOString() });
                else updateTask.mutate({ id: task.id, clear_due_date: true });
              }}
            />
          )}

          {/* Owner */}
          {(task.owner_id || task.user_id || task.owner_id) && (
            <span
              className="text-xs text-muted-foreground/40 truncate"
              title={task.owner_id || task.user_id || task.owner_id}
            >
              {(task.owner_id || task.user_id || task.owner_id || "").replace(/^person:/, "")}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="Set due date"
          onClick={() => setShowDateInput((v) => !v)}
        >
          <Calendar className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => deleteTask.mutate(task.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
