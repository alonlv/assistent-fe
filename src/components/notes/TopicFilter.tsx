"use client";

import { cn } from "@/lib/utils";
import type { Topic } from "@/types/api";

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

interface TopicFilterProps {
  topics: Topic[];
  selected: string | null;
  onSelect: (topic: string | null) => void;
}

export function TopicFilter({ topics, selected, onSelect }: TopicFilterProps) {
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
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelect(topic.name)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
            selected === topic.name
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <span className={cn("w-2 h-2 rounded-full shrink-0", TOPIC_DOT[topic.color] ?? "bg-gray-400")} />
          {topic.name}
          {topic.note_count > 0 && (
            <span className="opacity-60">{topic.note_count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
