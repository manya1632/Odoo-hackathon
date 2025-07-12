"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import RichTextEditorToolbar from "./RichTextEditorToolbar"
import { useEffect } from "react"

interface RichTextEditorProps {
  content: string
  onChange?: (html: string) => void // Make onChange optional
  editable?: boolean
}

export default function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
    ],
    content: content,
    onUpdate: onChange
      ? ({ editor }) => {
          onChange(editor.getHTML())
        }
      : undefined, // Only provide onUpdate if onChange is provided
    editable: editable,
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
      },
    },
  })

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  return (
    <div className="border rounded-md overflow-hidden">
      {editable && <RichTextEditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  )
}
