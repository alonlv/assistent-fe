"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Brain, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Memory {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}

export default function MemoriesPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const qc = useQueryClient();

  const { data: memories = [], isLoading, error } = useQuery<Memory[]>({
    queryKey: ["memories", submitted],
    queryFn: () =>
      fetch(`/api/memories${submitted ? `?q=${encodeURIComponent(submitted)}` : ""}`).then((r) =>
        r.json()
      ),
  });

  const del = useMutation({
    mutationFn: (id: string) => fetch(`/api/memories/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["memories"] }),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(query);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Memory</h1>
        <Button variant="ghost" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["memories"] })}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load memories.
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search memories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{submitted ? "No memories matching your search." : "No memories stored yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((m) => {
            const category = m.metadata?.category as string | undefined;
            return (
              <div key={m.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Brain className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{m.content}</p>
                  {category && (
                    <Badge variant="secondary" className="mt-1.5 text-xs capitalize">
                      {category.toLowerCase()}
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => del.mutate(m.id)}
                  disabled={del.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
