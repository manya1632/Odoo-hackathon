import { NextResponse } from "next/server"
import { toggleVote } from "@/lib/db"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id: answerId } = params
    const { userId, type } = await req.json() // type: 'up' or 'down'

    if (!userId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedAnswer = await toggleVote(answerId, userId, type)

    if (!updatedAnswer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 })
    }

    return NextResponse.json(updatedAnswer)
  } catch (error) {
    console.error("Error toggling vote:", error)
    return NextResponse.json({ error: "Failed to toggle vote" }, { status: 500 })
  }
}
