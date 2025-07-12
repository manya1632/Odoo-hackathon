"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/components/RichTextEditor"
import { toast } from "sonner" // ✅ changed to sonner
import { onClientAuthStateChanged } from "@/lib/client-auth"

interface AnswerFormProps {
  questionId: string
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const router = useRouter()
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    const unsubscribe = onClientAuthStateChanged((user) => {
      setCurrentUser(user)
      setIsLoadingUser(false)
    })
    return () => unsubscribe()
  }, [])

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentUser) {
      toast.error("Authentication Required", {
        description: "Please log in to post an answer.",
      })
      router.push("/auth")
      return
    }

    setIsSubmitting(true)

    try {
      const idToken = await currentUser.getIdToken()
      const res = await fetch(`/api/questions/${questionId}/answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ content: answerContent }),
      })

      if (res.ok) {
        toast.success("Answer posted!", {
          description: "Your answer has been successfully submitted.",
        })
        setAnswerContent("")
        router.refresh()
      } else {
        const errorData = await res.json()
        toast.error("Failed to post answer.", {
          description: errorData.error || "Please try again.",
        })
      }
    } catch (error: any) {
      console.error("Error submitting answer:", error)
      toast.error("An unexpected error occurred.", {
        description: error.message || "Please check your network connection.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingUser) {
    return <div className="text-center py-4">Loading user session...</div>
  }

  return (
    <form onSubmit={handleSubmitAnswer} className="space-y-4">
      <RichTextEditor content={answerContent} onChange={setAnswerContent} editable={true} />
      <Button type="submit" disabled={isSubmitting || !answerContent.trim() || !currentUser}>
        {isSubmitting ? "Submitting..." : "Post Your Answer"}
      </Button>
    </form>
  )
}
