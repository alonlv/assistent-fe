"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useUpdateNote } from "@/hooks/use-notes";

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
}

export function NoteEditor({ noteId, initialTitle, initialContent }: NoteEditorProps) {
  const updateNote = useUpdateNote();
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing…" }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (contentTimer.current) clearTimeout(contentTimer.current);
      contentTimer.current = setTimeout(() => {
        updateNote.mutate({ id: noteId, content: editor.getHTML() });
      }, 600);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[60vh] px-1",
      },
    },
  });

  useEffect(() => {
    return () => {
      if (contentTimer.current) clearTimeout(contentTimer.current);
      if (titleTimer.current) clearTimeout(titleTimer.current);
    };
  }, []);

  function handleTitleChange(value: string) {
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      updateNote.mutate({ id: noteId, title: value });
    }, 600);
  }

  return (
    <div className="p-4">
      <input
        type="text"
        defaultValue={initialTitle}
        placeholder="Untitled"
        onChange={(e) => handleTitleChange(e.target.value)}
        className="w-full mb-4 text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 resize-none"
      />
      <EditorContent editor={editor} />
    </div>
  );
}
