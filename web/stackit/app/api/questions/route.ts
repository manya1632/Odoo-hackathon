import { NextResponse } from "next/server"
import { QuestionModel, UserModel, convertToUserInterface } from "@/lib/db"
import { verifyAuth } from "@/lib/server-auth" // UPDATED IMPORT

export async function GET() {
  try {
    const questions = await QuestionModel.find({}).sort({ createdAt: -1 }).lean()

    const questionsWithAuthors = await Promise.all(
      questions.map(async (q) => {
        const authorDoc = await UserModel.findById(q.authorId).lean()
        const author = authorDoc ? convertToUserInterface(authorDoc) : null
        return { ...q, authorName: author?.name || "Unknown" }
      }),
    )
    return NextResponse.json(questionsWithAuthors)
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { user, error } = await verifyAuth(req) // Verify authentication
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { title, description, tags } = await req.json()

    if (!title || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newQuestion = await QuestionModel.create({
      title,
      description,
      tags: tags || [],
      authorId: user.id, // Use authenticated user's MongoDB 'id' from the User interface
    })
    return NextResponse.json(newQuestion, { status: 201 })
  } catch (error) {
    console.error("Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
