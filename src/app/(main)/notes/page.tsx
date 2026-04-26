"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotes, useCreateNote } from "@/hooks/use-notes";
import { NoteList } from "@/components/notes/NoteList";
import { TopicFilter } from "@/components/notes/TopicFilter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

export default function NotesPage() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [showTopicInput, setShowTopicInput] = useState(false);
  const { data: notes = [], isLoading } = useNotes();
  const createNote = useCreateNote();
  const router = useRouter();

  const topics = [...new Set(notes.map((n) => n.topic))].sort();

  const filtered = notes.filter((n) => {
    const matchesTopic = !selectedTopic || n.topic === selectedTopic;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      n.title.toLowerCase().includes(q) ||
      stripHtml(n.content).includes(q) ||
      n.topic.toLowerCase().includes(q);
    return matchesTopic && matchesSearch;
  });

  async function handleCreate() {
    const topic = newTopic.trim() || "general";
    const note = await createNote.mutateAsync({ content: "", topic });
    setShowTopicInput(false);
    setNewTopic("");
    router.push(`/notes/${note.id}`);
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        {!showTopicInput ? (
          <Button size="sm" onClick={() => setShowTopicInput(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Topic (e.g. work)"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setShowTopicInput(false);
              }}
            />
            <Button size="sm" onClick={handleCreate} disabled={createNote.isPending}>
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowTopicInput(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {topics.length > 0 && (
        <div className="mb-4">
          <TopicFilter topics={topics} selected={selectedTopic} onSelect={setSelectedTopic} />
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-lg border border-border bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {search && (
            <p className="text-xs text-muted-foreground mb-3">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
            </p>
          )}
          <NoteList notes={filtered} />
        </>
      )}
    </div>
  );
}
