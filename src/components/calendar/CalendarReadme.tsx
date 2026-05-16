"use client";

import { useState } from "react";
import { Pencil, Check, X, BookOpen } from "lucide-react";
import { Md } from "@/components/ui/md";
import { Button } from "@/components/ui/button";

interface Props {
  description: string;
  canEdit: boolean;
  onSave: (desc: string) => void;
  saving?: boolean;
}

export function CalendarReadme({ description, canEdit, onSave, saving }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(description);

  function handleSave() {
    onSave(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(description);
    setEditing(false);
  }

  if (!description && !canEdit) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <BookOpen className="h-3.5 w-3.5" />
          About this calendar
        </div>
        {canEdit && !editing && (
          <button
            onClick={() => { setDraft(description); setEditing(true); }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Edit README"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        {editing && (
          <div className="flex items-center gap-1">
            <button onClick={handleSave} className="text-primary hover:text-primary/80 transition-colors" disabled={saving}>
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a description for this calendar (markdown supported)…"
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
        />
      ) : description ? (
        <Md className="text-sm text-muted-foreground">{description}</Md>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          + Add a description…
        </button>
      )}
    </div>
  );
}
