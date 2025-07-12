import { NextResponse } from "next/server"
import { getQuestionById, getUserById } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Await params directly as per the error message
    const { id } = await params
    const question = await getQuestionById(id)

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const author = await getUserById(question.authorId)
    const questionWithAuthor = { ...question, authorName: author?.name || "Unknown" }

    return NextResponse.json(questionWithAuthor)
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}
