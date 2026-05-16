"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { useUpdateNote } from "@/hooks/use-notes";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Code2,
} from "lucide-react";

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
}

interface SlashCommand {
  label: string;
  description: string;
  icon: React.ReactNode;
  action: (editor: ReturnType<typeof useEditor>) => void;
}

const SLASH_COMMANDS: SlashCommand[] = [
  {
    label: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    label: "Bold",
    description: "Make text bold",
    icon: <Bold className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleBold().run(),
  },
  {
    label: "Italic",
    description: "Make text italic",
    icon: <Italic className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleItalic().run(),
  },
  {
    label: "Underline",
    description: "Underline text",
    icon: <UnderlineIcon className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleUnderline().run(),
  },
  {
    label: "Strikethrough",
    description: "Strike through text",
    icon: <Strikethrough className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleStrike().run(),
  },
  {
    label: "Bullet list",
    description: "Create a simple list",
    icon: <List className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleBulletList().run(),
  },
  {
    label: "Numbered list",
    description: "Create a numbered list",
    icon: <ListOrdered className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleOrderedList().run(),
  },
  {
    label: "Blockquote",
    description: "Add a quote block",
    icon: <Quote className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleBlockquote().run(),
  },
  {
    label: "Inline code",
    description: "Format as code",
    icon: <Code className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleCode().run(),
  },
  {
    label: "Code block",
    description: "Add a code block",
    icon: <Code2 className="h-4 w-4" />,
    action: (e) => e?.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: "Divider",
    description: "Insert a horizontal rule",
    icon: <Minus className="h-4 w-4" />,
    action: (e) => e?.chain().focus().setHorizontalRule().run(),
  },
];

export function NoteEditor({ noteId, initialTitle, initialContent }: NoteEditorProps) {
  const updateNote = useUpdateNote();
  const contentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [slashMenu, setSlashMenu] = useState<{ open: boolean; x: number; y: number; filter: string; selected: number }>({
    open: false, x: 0, y: 0, filter: "", selected: 0,
  });
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = SLASH_COMMANDS.filter((c) =>
    c.label.toLowerCase().includes(slashMenu.filter.toLowerCase())
  );

  const closeMenu = useCallback(() => {
    setSlashMenu((s) => ({ ...s, open: false, filter: "", selected: 0 }));
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: "Start writing… (type \\ for commands)" }),
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
      handleKeyDown(view, event) {
        if (slashMenu.open) {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSlashMenu((s) => ({ ...s, selected: Math.min(s.selected + 1, filteredCommands.length - 1) }));
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSlashMenu((s) => ({ ...s, selected: Math.max(s.selected - 1, 0) }));
            return true;
          }
          if (event.key === "Escape") {
            closeMenu();
            return true;
          }
          if (event.key === "Enter") {
            event.preventDefault();
            const cmd = filteredCommands[slashMenu.selected];
            if (cmd) {
              // delete the backslash + typed filter characters
              const { from } = view.state.selection;
              const deleteFrom = from - slashMenu.filter.length - 1;
              view.dispatch(view.state.tr.delete(deleteFrom, from));
              cmd.action(editor);
            }
            closeMenu();
            return true;
          }
          if (event.key === "Backspace" && slashMenu.filter === "") {
            closeMenu();
            return false;
          }
        }

        if (event.key === "\\") {
          const coords = view.coordsAtPos(view.state.selection.from);
          const editorEl = view.dom.closest(".editor-wrapper") as HTMLElement | null;
          const rect = editorEl?.getBoundingClientRect() ?? { top: 0, left: 0 };
          setSlashMenu({
            open: true,
            x: coords.left - rect.left,
            y: coords.bottom - rect.top + 4,
            filter: "",
            selected: 0,
          });
          return false;
        }

        if (slashMenu.open) {
          if (event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
            setSlashMenu((s) => ({ ...s, filter: s.filter + event.key, selected: 0 }));
          }
        }

        return false;
      },
    },
  });

  // close menu on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    if (slashMenu.open) document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [slashMenu.open, closeMenu]);

  // scroll selected item into view
  useEffect(() => {
    if (!menuRef.current) return;
    const item = menuRef.current.querySelector(`[data-index="${slashMenu.selected}"]`) as HTMLElement | null;
    item?.scrollIntoView({ block: "nearest" });
  }, [slashMenu.selected]);

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

  function applyCommand(cmd: SlashCommand) {
    if (!editor) return;
    const { from } = editor.state.selection;
    const deleteFrom = from - slashMenu.filter.length - 1;
    editor.chain().focus().deleteRange({ from: deleteFrom, to: from }).run();
    cmd.action(editor);
    closeMenu();
  }

  return (
    <div className="p-4 editor-wrapper relative">
      <input
        type="text"
        defaultValue={initialTitle}
        placeholder="Untitled"
        onChange={(e) => handleTitleChange(e.target.value)}
        className="w-full mb-4 text-3xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/40 resize-none"
      />

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex items-center gap-0.5 rounded-lg border border-border bg-background shadow-lg p-1"
        >
          <BubbleButton
            active={editor.isActive("bold")}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <Bold className="h-3.5 w-3.5" />
          </BubbleButton>
          <BubbleButton
            active={editor.isActive("italic")}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <Italic className="h-3.5 w-3.5" />
          </BubbleButton>
          <BubbleButton
            active={editor.isActive("underline")}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </BubbleButton>
          <BubbleButton
            active={editor.isActive("strike")}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </BubbleButton>
          <div className="w-px h-4 bg-border mx-0.5" />
          <BubbleButton
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </BubbleButton>
          <BubbleButton
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </BubbleButton>
          <BubbleButton
            active={editor.isActive("code")}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline code"
          >
            <Code className="h-3.5 w-3.5" />
          </BubbleButton>
        </BubbleMenu>
      )}

      <EditorContent editor={editor} />

      {slashMenu.open && filteredCommands.length > 0 && (
        <div
          ref={menuRef}
          style={{ left: slashMenu.x, top: slashMenu.y }}
          className="absolute z-50 w-64 rounded-lg border border-border bg-background shadow-xl overflow-hidden"
        >
          <div className="px-2 py-1.5 text-xs text-muted-foreground border-b border-border">
            Commands {slashMenu.filter && <span className="font-medium text-foreground">— {slashMenu.filter}</span>}
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            {filteredCommands.map((cmd, i) => (
              <button
                key={cmd.label}
                data-index={i}
                onClick={() => applyCommand(cmd)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                  i === slashMenu.selected
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
              >
                <span className="flex-shrink-0 text-muted-foreground">{cmd.icon}</span>
                <span>
                  <span className="font-medium">{cmd.label}</span>
                  <span className="block text-xs text-muted-foreground">{cmd.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BubbleButton({
  active,
  onClick,
  title,
  children,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {children}
    </button>
  );
}
