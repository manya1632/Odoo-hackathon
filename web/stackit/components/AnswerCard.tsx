"use client"

import { type Answer, CURRENT_USER_ID, type Question } from "@/lib/types"
import { ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import RichTextEditor from "./RickTextEditor"
import { formatDistanceToNow } from "date-fns"
import { useState } from "react"
import { useRouter } from "next/navigation" // Import useRouter

interface AnswerCardProps {
  answer: Answer
  authorName: string
  question: Question
  // Removed onVote and onAccept props as they cannot be passed from Server Components
}

export default function AnswerCard({ answer, authorName, question }: AnswerCardProps) {
  const router = useRouter() // Initialize useRouter
  const isAccepted = question.acceptedAnswerId === answer.id
  const isQuestionOwner = question.authorId === CURRENT_USER_ID
  const hasUpvoted = answer.upvotes.includes(CURRENT_USER_ID)
  const hasDownvoted = answer.downvotes.includes(CURRENT_USER_ID)
  const [currentAnswer, setCurrentAnswer] = useState(answer)

  const handleVote = async (voteType: "up" | "down") => {
    const response = await fetch(`/api/answers/${currentAnswer.id}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: CURRENT_USER_ID, type: voteType }),
    })
    if (response.ok) {
      const updatedAnswer = await response.json()
      setCurrentAnswer(updatedAnswer)
      router.refresh() // Revalidate the current page to show updated votes
    }
  }

  const handleAccept = async () => {
    const response = await fetch(`/api/answers/${currentAnswer.id}/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: question.id }),
    })
    if (response.ok) {
      router.refresh() // Revalidate the current page to show accepted answer
    }
  }

  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 ${isAccepted ? "border-green-500 ring-2 ring-green-500" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote("up")}
            className={hasUpvoted ? "text-primary" : ""}
            aria-label="Upvote"
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">{currentAnswer.upvotes.length - currentAnswer.downvotes.length}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote("down")}
            className={hasDownvoted ? "text-destructive" : ""}
            aria-label="Downvote"
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1">
          <RichTextEditor content={currentAnswer.content} editable={false} /> {/* Removed onChange */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
            <span>Answered by {authorName}</span>
            <span>{formatDistanceToNow(new Date(currentAnswer.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        {isQuestionOwner && (
          <Button
            variant={isAccepted ? "default" : "outline"}
            size="icon"
            onClick={handleAccept}
            className={`ml-auto ${isAccepted ? "bg-green-500 hover:bg-green-600 text-white" : "text-green-500 border-green-500 hover:bg-green-50"}`}
            aria-label={isAccepted ? "Accepted Answer" : "Accept Answer"}
          >
            <CheckCircle className="h-5 w-5" />
            <span className="sr-only">{isAccepted ? "Accepted Answer" : "Accept Answer"}</span>
          </Button>
        )}
        {isAccepted && !isQuestionOwner && (
          <div className="ml-auto text-green-500 flex items-center gap-1">
            <CheckCircle className="h-5 w-5" />
            <span className="text-sm font-medium">Accepted</span>
          </div>
        )}
      </div>
    </div>
  )
}
