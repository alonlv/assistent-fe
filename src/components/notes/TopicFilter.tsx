"use client";

import { cn } from "@/lib/utils";

interface TopicFilterProps {
  topics: string[];
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
          key={topic}
          onClick={() => onSelect(topic)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
            selected === topic
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {topic}
        </button>
      ))}
    </div>
  );
}
