// This file remains a Server Component (no "use client")

import type { Answer, Question } from "@/lib/types"
import RichTextEditor from "@/components/RickTextEditor"
import AnswerCard from "@/components/AnswerCard"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { Suspense } from "react"
import AnswerForm from "./answer-form"
import { Card } from "@/components/ui/card"

interface QuestionPageProps {
  params: Promise<{ id: string }> // params is a Promise in Next.js 15 [^1][^3]
}

async function getQuestionData(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/questions/${id}`, {
    cache: "no-store",
  })
  if (!res.ok) {
    const errorText = await res.text()
    console.error(`Failed to fetch question data for ID ${id}: ${res.status} ${res.statusText} - ${errorText}`)
    throw new Error("Failed to fetch question")
  }
  const question: Question = await res.json()

  const authorRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/users/${question.authorId}`,
    { cache: "no-store" },
  )
  if (!authorRes.ok) {
    const errorText = await authorRes.text()
    console.error(
      `Failed to fetch author data for ID ${question.authorId}: ${authorRes.status} ${authorRes.statusText} - ${errorText}`,
    )
    return { question, authorName: "Unknown" }
  }
  const author = await authorRes.json()

  return { question, authorName: author.name }
}

async function getAnswersData(questionId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/questions/${questionId}/answers`,
    { cache: "no-store" },
  )
  if (!res.ok) {
    const errorText = await res.text()
    console.error(
      `Failed to fetch answers for question ID ${questionId}: ${res.status} ${res.statusText} - ${errorText}`,
    )
    throw new Error("Failed to fetch answers")
  }
  const answers: Answer[] = await res.json()

  const answersWithAuthors = await Promise.all(
    answers.map(async (a) => {
      const authorRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/users/${a.authorId}`,
        { cache: "no-store" },
      )
      if (!authorRes.ok) {
        const errorText = await authorRes.text()
        console.error(
          `Failed to fetch author data for answer author ID ${a.authorId}: ${authorRes.status} ${authorRes.statusText} - ${errorText}`,
        )
        return { ...a, authorName: "Unknown" }
      }
      const author = await authorRes.json()
      return { ...a, authorName: author.name }
    }),
  )

  return answersWithAuthors
}

export default async function QuestionPage({ params }: QuestionPageProps) {
  const { id } = await params

  const { question, authorName } = await getQuestionData(id)
  const answers = await getAnswersData(id)

  return (
    <section className="py-8 max-w-4xl mx-auto">
      <Card className="p-6 mb-8">
        <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
            >
              {tag}
            </span>
          ))}
        </div>
        {/* Removed onChange prop as it's not needed for display-only RichTextEditor */}
        <RichTextEditor content={question.description} editable={false} />
        <div className="flex items-center justify-between text-sm text-muted-foreground mt-4">
          <span>Asked by {authorName}</span>
          <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
        </div>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Answers ({answers.length})</h2>
      <div className="space-y-6 mb-8">
        {answers.length === 0 ? (
          <p className="text-muted-foreground">No answers yet. Be the first to help!</p>
        ) : (
          answers.map((answer) => (
            <AnswerCard
              key={answer.id}
              answer={answer}
              authorName={answer.authorName}
              question={question}
              // Removed onVote and onAccept props
            />
          ))
        )}
      </div>

      <Separator className="my-8" />

      <h2 className="text-2xl font-bold mb-4">Your Answer</h2>
      <Suspense fallback={<div>Loading editor...</div>}>
        <AnswerForm questionId={question.id} />
      </Suspense>
    </section>
  )
}
