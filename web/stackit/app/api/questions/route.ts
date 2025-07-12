import { NextResponse } from "next/server"
import { getQuestions, getUserById, createQuestion } from "@/lib/db"
import { Question } from "@/lib/types"

// GET /api/questions
export async function GET() {
  try {
    const questions = getQuestions()

    const questionsWithAuthors = questions.map((q) => {
      const author = getUserById(q.authorId)
      return {
        ...q,
        authorName: author?.name || "Unknown",
      }
    })

    return NextResponse.json(questionsWithAuthors)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

// POST /api/questions
export async function POST(req: Request) {
  try {
    const { title, description, tags, authorId } = await req.json()

    if (!title || !description || !authorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newQuestion: Omit<Question, "id" | "createdAt" | "updatedAt"> = {
      title,
      description,
      tags: tags || [],
      authorId,
    }

    const createdQuestion = createQuestion(newQuestion)
    return NextResponse.json(createdQuestion, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
