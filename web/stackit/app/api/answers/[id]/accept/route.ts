import { NextResponse } from "next/server"
import { acceptAnswer, getQuestionById } from "@/lib/db"
import { CURRENT_USER_ID } from "@/lib/types"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: answerId } = params
    const { questionId } = await req.json()

    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 })
    }

    // Basic authorization: Only question owner can accept an answer
    const question = await getQuestionById(questionId)
    if (!question || question.authorId !== CURRENT_USER_ID) {
      return NextResponse.json({ error: "Unauthorized to accept this answer" }, { status: 403 })
    }

    const updatedQuestion = await acceptAnswer(questionId, answerId)

    if (!updatedQuestion) {
      return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 })
    }

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("Error accepting answer:", error)
    return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 })
  }
}
