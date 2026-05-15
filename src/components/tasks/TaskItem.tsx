"use client";

import { useState, useRef } from "react";
import type { Task } from "@/types/api";
import { useUpdateTask, useDeleteTask } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PRIORITY_BADGE_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatDueDate,
  isOverdue,
  nextPriority,
  tagColor,
} from "@/lib/task-utils";
import type { TaskStatus } from "@/types/api";

const STATUS_CYCLE: TaskStatus[] = ["todo", "in_progress", "done"];

export function TaskItem({ task, onTagClick }: { task: Task; showStatus?: boolean; onTagClick?: (tag: string) => void }) {
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [showDateInput, setShowDateInput] = useState(false);
  const [editingTag, setEditingTag] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const tagInputRef = useRef<HTMLInputElement>(null);
  const dueLabel = formatDueDate(task.due_date);
  const overdue = isOverdue(task.due_date) && task.status !== "done";

  function addTag() {
    const tag = tagInput.trim();
    if (!tag) { setEditingTag(false); return; }
    const next = [...new Set([...(task.tags ?? []), tag])];
    updateTask.mutate({ id: task.id, tags: next });
    setTagInput("");
    setEditingTag(false);
  }

  function removeTag(tag: string) {
    updateTask.mutate({ id: task.id, tags: (task.tags ?? []).filter((t) => t !== tag) });
  }

  function cycleStatus() {
    const idx = STATUS_CYCLE.indexOf(task.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    updateTask.mutate({ id: task.id, status: next });
  }

  return (
    <div className="flex items-start gap-3 py-3 px-3 rounded-lg hover:bg-accent/40 group transition-colors">
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
            "text-sm leading-snug block",
            task.status === "done" && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>

        <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
          {/* Status badge — always visible, click to cycle */}
          <button
            onClick={cycleStatus}
            title="Click to change status"
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
              STATUS_COLORS[task.status]
            )}
          >
            {STATUS_LABELS[task.status]}
          </button>

          {/* Priority badge — only when not "none" */}
          {task.priority !== "none" && (
            <button
              title={PRIORITY_LABELS[task.priority]}
              onClick={() => updateTask.mutate({ id: task.id, priority: nextPriority(task.priority) })}
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-medium transition-colors cursor-pointer",
                PRIORITY_BADGE_COLORS[task.priority]
              )}
            >
              {PRIORITY_LABELS[task.priority]}
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
          {(task.tags ?? []).map((tag) => (
            <span
              key={tag}
              className={cn(
                "group/tag flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors",
                tagColor(tag)
              )}
              onClick={() => onTagClick?.(tag)}
            >
              #{tag}
              <button
                className="opacity-0 group-hover/tag:opacity-100 ml-0.5 leading-none hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}

          {editingTag ? (
            <input
              ref={tagInputRef}
              autoFocus
              className="text-xs border border-input rounded-full px-2 py-0.5 w-24 outline-none bg-background"
              placeholder="tag name"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addTag(); if (e.key === "Escape") setEditingTag(false); }}
              onBlur={addTag}
            />
          ) : (
            <button
              className="opacity-0 group-hover:opacity-60 text-xs text-muted-foreground hover:opacity-100"
              title="Add tag"
              onClick={() => setEditingTag(true)}
            >
              <Tag className="h-3 w-3" />
            </button>
          )}

          {/* Date picker trigger */}
          {showDateInput && (
            <input
              type="date"
              autoFocus
              className="text-xs border border-input rounded px-1 py-0.5 bg-background"
              defaultValue={task.due_date ? task.due_date.split("T")[0] : ""}
              onBlur={(e) => {
                setShowDateInput(false);
                const val = e.target.value;
                if (val) updateTask.mutate({ id: task.id, due_date: new Date(val).toISOString() });
                else updateTask.mutate({ id: task.id, clear_due_date: true });
              }}
            />
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
