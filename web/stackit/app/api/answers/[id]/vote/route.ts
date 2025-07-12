import { NextResponse } from "next/server"
import { AnswerModel, convertToAnswerInterface } from "@/lib/db"
import { verifyAuth } from "@/lib/server-auth" // UPDATED IMPORT
import type mongoose from "mongoose"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { user, error } = await verifyAuth(req) // Verify authentication
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { id: answerId } = params
    const { type } = await req.json() // type: 'up' or 'down'

    if (!type) {
      return NextResponse.json({ error: "Missing vote type" }, { status: 400 })
    }

    const answer = await AnswerModel.findById(answerId)
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    const userId = user.id // Authenticated user's MongoDB 'id' from the User interface

    if (type === "up") {
      if (answer.upvotes.includes(userId as any)) {
        answer.upvotes = answer.upvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId) as any
      } else {
        answer.upvotes.push(userId as any)
        answer.downvotes = answer.downvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId) as any
      }
    } else {
      if (answer.downvotes.includes(userId as any)) {
        answer.downvotes = answer.downvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId) as any
      } else {
        answer.downvotes.push(userId as any)
        answer.upvotes = answer.upvotes.filter((id: mongoose.Types.ObjectId) => id.toString() !== userId) as any
      }
    }
    await answer.save()

    return NextResponse.json(convertToAnswerInterface(answer.toObject()))
  } catch (error) {
    console.error("Error toggling vote:", error)
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 })
  }
}
