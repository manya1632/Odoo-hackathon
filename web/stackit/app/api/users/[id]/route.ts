import { NextResponse } from "next/server"
import { getUserById } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Await params directly as per the error message
    const { id } = await params
    const user = getUserById(id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { email, ...publicUser } = user
    return NextResponse.json(publicUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
