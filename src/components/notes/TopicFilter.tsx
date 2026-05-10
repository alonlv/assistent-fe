"use client";

import { cn } from "@/lib/utils";
import type { Topic } from "@/types/api";
import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";

export const TOPIC_DOT: Record<string, string> = {
  gray: "bg-gray-400",
  red: "bg-red-400",
  orange: "bg-orange-400",
  yellow: "bg-yellow-400",
  green: "bg-green-500",
  teal: "bg-teal-400",
  blue: "bg-blue-400",
  indigo: "bg-indigo-400",
  purple: "bg-purple-400",
  pink: "bg-pink-400",
};

const COLORS = Object.keys(TOPIC_DOT);

interface TopicFilterProps {
  topics: Topic[];
  selected: string | null;
  onSelect: (topic: string | null) => void;
  onEdit?: (id: string, name: string, color: string) => void;
  onDelete?: (id: string) => void;
}

function TopicEditForm({
  topic,
  onSave,
  onCancel,
}: {
  topic: Topic;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(topic.name);
  const [color, setColor] = useState(topic.color || "gray");

  return (
    <div className="flex items-center gap-1.5 p-1" onClick={(e) => e.stopPropagation()}>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave(name.trim(), color);
          if (e.key === "Escape") onCancel();
        }}
        className="h-6 w-24 rounded border border-input bg-background px-1.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <select
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="h-6 rounded border border-input bg-background px-1 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {COLORS.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <button onClick={() => onSave(name.trim(), color)} className="text-green-600 hover:text-green-700">
        <Check className="h-3.5 w-3.5" />
      </button>
      <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function TopicFilter({ topics, selected, onSelect, onEdit, onDelete }: TopicFilterProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
          selected === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        All
      </button>
      {topics.map((topic) =>
        editingId === topic.id && onEdit ? (
          <div key={topic.id} className="rounded-full border border-border bg-secondary text-secondary-foreground overflow-hidden">
            <TopicEditForm
              topic={topic}
              onSave={(name, color) => {
                onEdit(topic.id, name, color);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          </div>
        ) : (
          <div
            key={topic.id}
            className={cn(
              "group flex items-center gap-1 rounded-full text-xs font-medium capitalize transition-colors",
              selected === topic.name
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <button
              onClick={() => onSelect(topic.name)}
              className="flex items-center gap-1.5 px-3 py-1"
            >
              <span className={cn("w-2 h-2 rounded-full shrink-0", TOPIC_DOT[topic.color] ?? "bg-gray-400")} />
              {topic.name}
              {topic.note_count > 0 && (
                <span className="opacity-60">{topic.note_count}</span>
              )}
            </button>
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-0.5 pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingId(topic.id); }}
                    className="text-muted-foreground hover:text-foreground p-0.5"
                    title="Edit topic"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(topic.id); }}
                    className="text-muted-foreground hover:text-destructive p-0.5"
                    title="Delete topic"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
}
