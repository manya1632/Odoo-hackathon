"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import RichTextEditor from "@/components/RickTextEditor"
import { CURRENT_USER_ID } from "@/lib/types"
import { toast } from "sonner"

interface AnswerFormProps {
  questionId: string
}

export default function AnswerForm({ questionId }: AnswerFormProps) {
  const router = useRouter()
  const [answerContent, setAnswerContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const res = await fetch(`/api/questions/${questionId}/answers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: answerContent,
        authorId: CURRENT_USER_ID, // In a real app, this would come from auth context
      }),
    })

    if (res.ok) {
      toast.success("Your answer has been successfully submitted.") // ✅ success toast
      setAnswerContent("")
      router.refresh()
    } else {
      toast.error("Failed to post answer. Please try again.") // ✅ error toast
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmitAnswer} className="space-y-4">
      <RichTextEditor content={answerContent} onChange={setAnswerContent} editable={true} />
      <Button type="submit" disabled={isSubmitting || !answerContent.trim()}>
        {isSubmitting ? "Submitting..." : "Post Your Answer"}
      </Button>
    </form>
  )
}
