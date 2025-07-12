"use client"

import type { Answer, Question } from "@/lib/types"
import { ThumbsUp, ThumbsDown, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import RichTextEditor from "./RichTextEditor"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onClientAuthStateChanged } from "@/lib/client-auth"
import { toast } from "sonner" // ✅ Replaced custom toast with sonner

interface AnswerCardProps {
  answer: Answer
  authorName: string
  question: Question
}

export default function AnswerCard({ answer, authorName, question }: AnswerCardProps) {
  const router = useRouter()
  const [currentAnswer, setCurrentAnswer] = useState(answer)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    const unsubscribe = onClientAuthStateChanged((user) => {
      setCurrentUser(user)
      setIsLoadingUser(false)
    })
    return () => unsubscribe()
  }, [])

  const isAccepted = question.acceptedAnswerId === currentAnswer.id
  const isQuestionOwner = question.authorId === currentUser?.uid
  const hasUpvoted = currentAnswer.upvotes.includes(currentUser?.uid)
  const hasDownvoted = currentAnswer.downvotes.includes(currentUser?.uid)

  const handleVote = async (voteType: "up" | "down") => {
    if (!currentUser) {
      toast.error("Authentication Required", {
        description: "Please log in to vote.",
      })
      router.push("/auth")
      return
    }

    try {
      const idToken = await currentUser.getIdToken()
      const response = await fetch(`/api/answers/${currentAnswer.id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ type: voteType }),
      })
      if (response.ok) {
        const updatedAnswer = await response.json()
        setCurrentAnswer(updatedAnswer)
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error("Failed to vote", {
          description: errorData.error || "Please try again.",
        })
      }
    } catch (error: any) {
      console.error("Error voting:", error)
      toast.error("An unexpected error occurred", {
        description: error.message || "Please check your network connection.",
      })
    }
  }

  const handleAccept = async () => {
    if (!currentUser) {
      toast.error("Authentication Required", {
        description: "Please log in to accept an answer.",
      })
      router.push("/auth")
      return
    }

    if (!isQuestionOwner) {
      toast.error("Unauthorized", {
        description: "Only the question owner can accept an answer.",
      })
      return
    }

    try {
      const idToken = await currentUser.getIdToken()
      const response = await fetch(`/api/answers/${currentAnswer.id}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ questionId: question.id }),
      })
      if (response.ok) {
        toast.success("Answer Accepted!", {
          description: "This answer has been marked as accepted.",
        })
        router.refresh()
      } else {
        const errorData = await response.json()
        toast.error("Failed to accept answer", {
          description: errorData.error || "Please try again.",
        })
      }
    } catch (error: any) {
      console.error("Error accepting answer:", error)
      toast.error("An unexpected error occurred", {
        description: error.message || "Please check your network connection.",
      })
    }
  }

  if (isLoadingUser) {
    return <div className="text-center py-4">Loading user data...</div>
  }

  return (
    <div
      className={`rounded-lg border bg-card text-card-foreground shadow-sm p-6 ${
        isAccepted ? "border-green-500 ring-2 ring-green-500" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote("up")}
            className={hasUpvoted ? "text-primary" : ""}
            aria-label="Upvote"
            disabled={!currentUser}
          >
            <ThumbsUp className="h-5 w-5" />
          </Button>
          <span className="font-semibold text-lg">
            {currentAnswer.upvotes.length - currentAnswer.downvotes.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleVote("down")}
            className={hasDownvoted ? "text-destructive" : ""}
            aria-label="Downvote"
            disabled={!currentUser}
          >
            <ThumbsDown className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1">
          <RichTextEditor content={currentAnswer.content} editable={false} />
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
            className={`ml-auto ${
              isAccepted
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "text-green-500 border-green-500 hover:bg-green-50"
            }`}
            aria-label={isAccepted ? "Accepted Answer" : "Accept Answer"}
            disabled={!currentUser}
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
