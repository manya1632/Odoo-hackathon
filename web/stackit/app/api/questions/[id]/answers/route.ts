import { NextResponse } from "next/server"
import { AnswerModel, UserModel, convertToUserInterface, convertToAnswerInterface } from "@/lib/db"
import { verifyAuth } from "@/lib/server-auth" // UPDATED IMPORT

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: questionId } = params
    const answerDocs = await AnswerModel.find({ questionId }).sort({ createdAt: 1 }).lean()

    const answersWithAuthors = await Promise.all(
      answerDocs.map(async (aDoc) => {
        const answer = convertToAnswerInterface(aDoc)
        const authorDoc = await UserModel.findById(answer.authorId).lean()
        const author = authorDoc ? convertToUserInterface(authorDoc) : null
        return { ...answer, authorName: author?.name || "Unknown" }
      }),
    )

    return NextResponse.json(answersWithAuthors)
  } catch (error) {
    console.error("Error fetching answers:", error)
    return NextResponse.json({ error: "Failed to fetch answers" }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req) // Verify authentication
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { id: questionId } = params
    const { content } = await req.json()

    if (!content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAnswer = await AnswerModel.create({
      questionId,
      content,
      authorId: user.id, // Use authenticated user's MongoDB 'id' from the User interface
    })
    return NextResponse.json(convertToAnswerInterface(newAnswer.toObject()), { status: 201 })
  } catch (error) {
    console.error("Error creating answer:", error)
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 })
  }
}
