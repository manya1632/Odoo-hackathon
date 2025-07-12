"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/RickTextEditor"
import { CURRENT_USER_ID } from "@/lib/types"
import { toast } from "sonner"

export default function AskQuestionPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    const res = await fetch("/api/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        tags,
        authorId: CURRENT_USER_ID,
      }),
    })

    if (res.ok) {
      const newQuestion = await res.json()
      toast.success("Your question has been successfully submitted.") // ✅
      router.push(`/questions/${newQuestion.id}`)
    } else {
      toast.error("Failed to post question. Please try again.") // ✅
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Ask a New Question</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="title">Question Title</Label>
          <Input
            id="title"
            placeholder="e.g., How to use Server Actions in Next.js 15?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <RichTextEditor content={description} onChange={setDescription} editable={true} />
          <p className="text-sm text-muted-foreground mt-2">Provide a detailed description of your question.</p>
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="e.g., Next.js, React, Database"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-2">Add relevant tags to help others find your question.</p>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Post Your Question"}
        </Button>
      </form>
    </section>
  )
}
