import { NextResponse } from "next/server"
import { QuestionModel, convertToQuestionInterface } from "@/lib/db"
import { verifyAuth } from "@/lib/server-auth" // UPDATED IMPORT

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req) // Verify authentication
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { id: answerId } = params
    const { questionId } = await req.json()

    if (!questionId) {
      return NextResponse.json({ error: "Missing questionId" }, { status: 400 })
    }

    const question = await QuestionModel.findById(questionId)
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Authorization: Only question owner can accept an answer
    if (question.authorId.toString() !== user.id.toString()) {
      return NextResponse.json({ error: "Unauthorized to accept this answer" }, { status: 403 })
    }

    question.acceptedAnswerId = answerId as any
    await question.save()

    return NextResponse.json(convertToQuestionInterface(question.toObject()))
  } catch (error) {
    console.error("Error accepting answer:", error)
    return NextResponse.json({ error: "Failed to accept answer" }, { status: 500 })
  }
}
