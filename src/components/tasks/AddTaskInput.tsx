"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useCreateTask } from "@/hooks/use-tasks";
import { useSelectedUser } from "@/context/user-context";
import { Plus } from "lucide-react";

export function AddTaskInput() {
  const [value, setValue] = useState("");
  const [tags, setTags] = useState("");
  const createTask = useCreateTask();
  const { selectedUserId } = useSelectedUser();

  function submit() {
    const title = value.trim();
    if (!title) return;
    const tagsArr = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    createTask.mutate({ title, tags: tagsArr, user_id: selectedUserId ?? undefined });
    setValue("");
    setTags("");
  }

  return (
    <div className="relative flex gap-2 items-center">
      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-9"
        placeholder="Add a task and press Enter…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        disabled={createTask.isPending}
      />
      <Input
        className="w-40"
        placeholder="tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
        disabled={createTask.isPending}
      />
    </div>
  );
}
