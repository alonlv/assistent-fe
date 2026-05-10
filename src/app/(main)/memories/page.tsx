"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Brain, Search, RefreshCw, AlertCircle, Plus, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Md } from "@/components/ui/md";
import type { Memory } from "@/types/api";

type EditState = { content: string; category: string };

function MemoryForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: EditState;
  onSave: (s: EditState) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [s, setS] = useState(initial);
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Content</label>
        <textarea
          value={s.content}
          onChange={(e) => setS((p) => ({ ...p, content: e.target.value }))}
          placeholder="What should I remember?"
          rows={3}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Category (optional)</label>
        <Input
          value={s.category}
          onChange={(e) => setS((p) => ({ ...p, category: e.target.value }))}
          placeholder="e.g. preference, fact, context…"
        />
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving}>
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(s)} disabled={saving || !s.content.trim()}>
          <Check className="h-3.5 w-3.5 mr-1" /> Save
        </Button>
      </div>
    </div>
  );
}

export default function MemoriesPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: memories = [], isLoading, error } = useQuery<Memory[]>({
    queryKey: ["memories", submitted],
    queryFn: () =>
      fetch(`/api/memories${submitted ? `?q=${encodeURIComponent(submitted)}` : ""}`).then((r) => r.json()),
  });

  const create = useMutation({
    mutationFn: (body: object) =>
      fetch("/api/memories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memories"] }); setShowAdd(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      fetch(`/api/memories/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["memories"] }); setEditId(null); },
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
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["memories"] })}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={() => { setShowAdd(true); setEditId(null); }}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Could not load memories.
        </div>
      )}

      {showAdd && (
        <div className="mb-4">
          <MemoryForm
            initial={{ content: "", category: "" }}
            onSave={(s) => create.mutate({ content: s.content, category: s.category || undefined })}
            onCancel={() => setShowAdd(false)}
            saving={create.isPending}
          />
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
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : memories.length === 0 && !showAdd ? (
        <div className="text-center py-16 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">{submitted ? "No memories matching your search." : "No memories stored yet."}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {memories.map((m) => {
            const category = m.metadata?.category as string | undefined;
            return editId === m.id ? (
              <MemoryForm
                key={m.id}
                initial={{ content: m.content, category: category ?? "" }}
                onSave={(s) => update.mutate({ id: m.id, body: { content: s.content, category: s.category || undefined } })}
                onCancel={() => setEditId(null)}
                saving={update.isPending}
              />
            ) : (
              <div key={m.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Brain className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <Md className="text-sm">{m.content}</Md>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {category && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {category.toLowerCase()}
                      </Badge>
                    )}
                    {(m.owner_id || m.user_id || m.person_id) && (
                      <span className="text-xs text-muted-foreground/50 truncate" title={m.owner_id || m.user_id || m.person_id}>
                        {(m.owner_id || m.user_id || m.person_id || "").replace(/^person:/, "")}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                  onClick={() => { setEditId(m.id); setShowAdd(false); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600 shrink-0"
                  onClick={() => del.mutate(m.id)} disabled={del.isPending}>
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
