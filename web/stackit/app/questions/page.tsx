import QuestionCard from "@/components/QuestionCard"
import { getQuestions, getUserById, convertToUserInterface } from "@/lib/db" // Import getQuestions, getUserById, convertToUserInterface

async function getQuestionsData() {
  const questions = await getQuestions() // This now returns Question[] directly

  // Fetch author names for each question
  const questionsWithAuthors = await Promise.all(
    questions.map(async (q) => {
      const authorRes = await getUserById(q.authorId) // This returns a lean Mongoose doc
      const author = authorRes ? convertToUserInterface(authorRes) : null // Convert to User interface
      return { ...q, authorName: author?.name || "Unknown" }
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
