import { NextResponse } from "next/server"
import { createAnswer, getAnswersForQuestion, getUserById } from "@/lib/db"
import type { Answer } from "@/lib/types"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Await params directly as per the error message
    const { id: questionId } = await params
    const answers = await getAnswersForQuestion(questionId)

    const answersWithAuthors = answers.map((a) => {
      const author = getUserById(a.authorId)
      return { ...a, authorName: author?.name || "Unknown" }
    })

    return NextResponse.json(answersWithAuthors)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    // Await params directly as per the error message
    const { id: questionId } = await params
    const { content, authorId } = await req.json()

    if (!content || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAnswer: Omit<Answer, "id" | "createdAt" | "updatedAt" | "upvotes" | "downvotes"> = {
      questionId,
      content,
      authorId,
    }
    const createdAnswer = await createAnswer(newAnswer)
    return NextResponse.json(createdAnswer, { status: 201 })
  } catch (error) {
    console.error("Error creating answer:", error)
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 })
  }
}
