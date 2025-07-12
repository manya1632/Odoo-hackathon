import RichTextEditor from "@/components/RichTextEditor"
import AnswerCard from "@/components/AnswerCard"
import { Separator } from "@/components/ui/separator"
import { formatDistanceToNow } from "date-fns"
import { Suspense } from "react"
import AnswerForm from "./answer-form"
import { Card } from "@/components/ui/card"
import {
  getQuestionById,
  getAnswersForQuestion,
  getUserById,
  convertToUserInterface,
  convertToQuestionInterface,
  convertToAnswerInterface,
} from "@/lib/db" // Import conversion helpers

interface QuestionPageProps {
  params: Promise<{ id: string }> // params is a Promise in Next.js 15 [^1][^3]
}

async function getQuestionData(id: string) {
  const questionDoc = await getQuestionById(id) // This returns a lean Mongoose doc
  if (!questionDoc) {
    throw new Error("Failed to fetch question")
  }
  const question = convertToQuestionInterface(questionDoc) // Convert to Question interface

  const authorDoc = await getUserById(question.authorId) // This returns a lean Mongoose doc
  const author = authorDoc ? convertToUserInterface(authorDoc) : null // Convert to User interface

  return { question, authorName: author?.name || "Unknown" }
}

async function getAnswersData(questionId: string) {
  const answerDocs = await getAnswersForQuestion(questionId) // This returns lean Mongoose docs

  const answersWithAuthors = await Promise.all(
    answerDocs.map(async (a) => {
      const answer = convertToAnswerInterface(a) // Convert to Answer interface
      const authorDoc = await getUserById(answer.authorId) // This returns a lean Mongoose doc
      const author = authorDoc ? convertToUserInterface(authorDoc) : null // Convert to User interface
      return { ...answer, authorName: author?.name || "Unknown" }
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
              key={answer.id} // Use answer.id
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
        <AnswerForm questionId={question.id} /> {/* Use question.id */}
      </Suspense>
    </section>
  )
}
