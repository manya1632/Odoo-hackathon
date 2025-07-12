import { NextResponse } from "next/server"
import { createAnswer, getAnswersForQuestion, getUserById } from "@/lib/db"
import { Answer } from "@/lib/types"

// GET /api/questions/[id]/answers
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: questionId } = params
    const answers = getAnswersForQuestion(questionId)

    const answersWithAuthors = answers.map((a) => {
      const author = getUserById(a.authorId)
      return {
        ...a,
        authorName: author?.name || "Unknown",
      }
    })

    return NextResponse.json(answersWithAuthors)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}

// POST /api/questions/[id]/answers
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: questionId } = params
    const { content, authorId } = await req.json()

    if (!content || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAnswer: Omit<Answer, "id" | "createdAt" | "updatedAt" | "upvotes" | "downvotes"> = {
      questionId,
      content,
      authorId,
    }

    const createdAnswer = createAnswer(newAnswer)
    return NextResponse.json(createdAnswer, { status: 201 })
  } catch (error) {
    console.error("Error creating answer:", error)
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 })
  }
}
