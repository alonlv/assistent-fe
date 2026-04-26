import type { Note } from "@/types/api";
import { NoteCard } from "./NoteCard";

export function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12 text-sm">
        No notes yet. Create your first note.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}
