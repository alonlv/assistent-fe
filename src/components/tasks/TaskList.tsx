"use client";

import type { Task } from "@/types/api";
import { TaskItem } from "./TaskItem";

export function TaskList({ tasks, showStatus = false }: { tasks: Task[]; showStatus?: boolean }) {
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  if (tasks.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">
        No tasks yet. Add your first task above.
      </p>
    );
  }

  return (
    <div>
      <div className="divide-y divide-border/50">
        {open.map((task) => (
          <TaskItem key={task.id} task={task} showStatus={showStatus} />
        ))}
      </div>
      {done.length > 0 && (
        <div className="mt-6">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-3 mb-1">
            Completed ({done.length})
          </p>
          <div className="divide-y divide-border/50 opacity-60">
            {done.map((task) => (
              <TaskItem key={task.id} task={task} showStatus={showStatus} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
