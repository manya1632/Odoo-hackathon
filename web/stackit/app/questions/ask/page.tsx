"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import RichTextEditor from "@/components/RichTextEditor"
import { onClientAuthStateChanged } from "@/lib/client-auth"
import { toast } from "sonner" // ✅ switched to sonner

export default function AskQuestionPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tagsInput, setTagsInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentMongoUser, setCurrentMongoUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    const unsubscribe = onClientAuthStateChanged(async (user) => {
      setCurrentUser(user)
      if (user) {
        const res = await fetch(`/api/users/${user.uid}`)
        if (res.ok) {
          const mongoUser = await res.json()
          setCurrentMongoUser(mongoUser)
        } else {
          console.error("Failed to fetch MongoDB user for Firebase UID:", user.uid)
          toast.error("User data error", {
            description: "Could not retrieve full user profile. Please try logging in again.",
          })
          router.push("/auth")
        }
      } else {
        toast.error("Authentication Required", {
          description: "Please log in to ask a question.",
        })
        router.push("/auth")
      }
      setIsLoadingUser(false)
    })
    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser || !currentMongoUser) return

    setIsSubmitting(true)
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)

    try {
      const idToken = await currentUser.getIdToken()
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags,
        }),
      })

      if (res.ok) {
        const newQuestion = await res.json()
        toast.success("Question posted!", {
          description: "Your question has been successfully submitted.",
        })
        router.push(`/questions/${newQuestion.id}`)
      } else {
        const errorData = await res.json()
        toast.error("Failed to post question", {
          description: errorData.error || "Please try again.",
        })
      }
    } catch (error: any) {
      console.error("Error submitting question:", error)
      toast.error("An unexpected error occurred", {
        description: error.message || "Please check your network connection.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingUser) {
    return <div className="text-center py-8">Loading user session...</div>
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
          <p className="text-sm text-muted-foreground mt-2">
            Provide a detailed description of your question.
          </p>
        </div>
        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            placeholder="e.g., Next.js, React, Database"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
          <p className="text-sm text-muted-foreground mt-2">
            Add relevant tags to help others find your question.
          </p>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || !currentUser || !currentMongoUser}>
          {isSubmitting ? "Submitting..." : "Post Your Question"}
        </Button>
      </form>
    </section>
  )
}
