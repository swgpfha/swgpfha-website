// RichViewer.tsx
import { useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

type Props = {
  value: string; // TipTap JSON string or plain text
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
      { type: "paragraph", content: value ? [{ type: "text", text: value }] : [] }
    ]
  };
}

export default function RichViewer({ value, className }: Props) {
  const doc = useMemo(() => toDoc(value), [value]);

  const editor = useEditor({
    editable: false,
    content: doc,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    editorProps: {
      attributes: {
        class: `prose prose-neutral dark:prose-invert max-w-none ${className ?? ""}`,
      },
    },
  });

  // 🔧 keep editor in sync when `value` changes
  useEffect(() => {
    if (!editor) return;
    const next = toDoc(value);
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
