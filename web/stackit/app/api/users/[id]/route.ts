import { NextResponse } from "next/server"
import { UserModel, convertToUserInterface } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    // When fetching user by Firebase UID, use findOne({ firebaseUid: id })
    // The `id` param here is the Firebase UID, not MongoDB _id
    const userDoc = await UserModel.findOne({ firebaseUid: id }).lean()

    if (!userDoc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = convertToUserInterface(userDoc)
    const { firebaseUid, ...publicUser } = user
    return NextResponse.json(publicUser)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
