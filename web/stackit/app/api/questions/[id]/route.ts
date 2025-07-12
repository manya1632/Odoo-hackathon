import { NextResponse } from "next/server"
import { getQuestionById, getUserById, convertToUserInterface, convertToQuestionInterface } from "@/lib/db" 

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params // params is already awaited by Next.js 15
    const questionDoc = await getQuestionById(id) // This returns a lean Mongoose doc
    if (!questionDoc) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const question = convertToQuestionInterface(questionDoc) // Convert to Question interface

    const authorDoc = await getUserById(question.authorId) // This returns a lean Mongoose doc
    const author = authorDoc ? convertToUserInterface(authorDoc) : null // Convert to User interface
    const questionWithAuthor = { ...question, authorName: author?.name || "Unknown" }

    return NextResponse.json(questionWithAuthor)
  } catch (error) {
    console.error("Error fetching question:", error)
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 })
  }
}
