import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, Quote, Code, Heading1, Heading2,
  AlignLeft, AlignCenter, AlignRight, Undo2, Redo2
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string; // TipTap JSON string or plain text
  onChange: (jsonString: string) => void;
  placeholder?: string;
  className?: string;
};

function toDoc(value: string): JSONContent {
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object" && (parsed as any).type === "doc") {
      return parsed as JSONContent;
    }
  } catch {}
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: value ? [{ type: "text", text: value }] : []
      }
    ]
  };
}

export default function RichEditor({ value, onChange, placeholder, className }: Props) {
  const content = useMemo(() => toDoc(value), [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        // Use {} instead of true to satisfy the types, or omit to keep defaults enabled
        codeBlock: {},
        blockquote: {},
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write something amazing…",
      }),
      Underline,
      Link.configure({
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert ring-0 focus:outline-none max-w-none min-h-[220px] p-4 rounded-md bg-background border",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Keep in sync when switching selected block
  useEffect(() => {
    if (!editor) return;
    const next = toDoc(value);
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      // pass options object instead of boolean
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 mb-2">
        <Toggle pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>

        <div className="mx-2 h-5 w-px bg-border" />

        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 className="h-4 w-4 mr-1" /> H1
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4 mr-1" /> H2
        </Button>

        <div className="mx-2 h-5 w-px bg-border" />

        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          <Code className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-5 w-px bg-border" />

        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-5 w-px bg-border" />

        <Button variant="outline" size="sm" onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-5 w-px bg-border" />

        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
