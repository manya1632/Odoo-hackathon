"use client"

import type { Editor } from "@tiptap/react"
import { Bold, Italic, List, ListOrdered, Strikethrough, LinkIcon, Unlink } from "lucide-react"

import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"

interface RichTextEditorToolbarProps {
  editor: Editor | null
}

export default function RichTextEditorToolbar({ editor }: RichTextEditorToolbarProps) {
  const [url, setUrl] = useState("")

  if (!editor) {
    return null
  }

  const setLink = () => {
    if (url) {
      editor.chain().focus().setLink({ href: url, target: "_blank" }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Toggle bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Toggle italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Toggle strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Toggle bullet list"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Toggle ordered list"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Popover>
        <PopoverTrigger asChild>
          <Toggle
            size="sm"
            pressed={editor.isActive("link")}
            aria-label="Toggle link"
            onClick={() => setUrl(editor.getAttributes("link").href || "")}
          >
            <LinkIcon className="h-4 w-4" />
          </Toggle>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-2">
          <div className="flex space-x-2">
            <Input
              type="url"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={setLink}>
              {editor.isActive("link") ? "Update" : "Add"}
            </Button>
            {editor.isActive("link") && (
              <Button size="sm" variant="outline" onClick={() => editor.chain().focus().unsetLink().run()}>
                <Unlink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
