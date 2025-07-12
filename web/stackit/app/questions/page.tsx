import type { Question } from "@/lib/types"
import QuestionCard from "@/components/QuestionCard"

async function getQuestionsData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/questions`, {
    cache: "no-store",
  })
  if (!res.ok) {
    throw new Error("Failed to fetch questions")
  }
  const questions: Question[] = await res.json()

  // Fetch author names for each question
  const questionsWithAuthors = await Promise.all(
    questions.map(async (q) => {
      const authorRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/users/${q.authorId}`,
        { cache: "no-store" },
      )
      const author = authorRes.ok ? await authorRes.json() : { name: "Unknown" }
      return { ...q, authorName: author.name }
    }),
  )

  return questionsWithAuthors
}

export default async function QuestionsPage() {
  const questions = await getQuestionsData()

  return (
    <section className="py-8">
      <h2 className="text-3xl font-bold mb-6">All Questions</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {questions.map((question) => (
          <QuestionCard key={question.id} question={question} authorName={question.authorName} />
        ))}
      </div>
      {questions.length === 0 && (
        <p className="text-center text-muted-foreground mt-8">No questions asked yet. Be the first!</p>
      )}
    </section>
  )
}
