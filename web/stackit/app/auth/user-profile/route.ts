import { NextResponse } from "next/server"
import { getUserByFirebaseUid } from "@/lib/db" // Only import server-side DB functions
import { verifyAuth } from "@/lib/server-auth" // Import server-side auth helper

export async function GET(req: Request) {
  try {
    const { user: firebaseAuthUser, error } = await verifyAuth(req) // Get authenticated Firebase user
    if (error || !firebaseAuthUser) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    // Use the Firebase UID from the authenticated token to find the MongoDB user
    const mongoUser = await getUserByFirebaseUid(firebaseAuthUser.firebaseUid)

    if (!mongoUser) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 })
    }

    // Return the MongoDB user profile (excluding sensitive Firebase UID if desired, though it's already public in the token)
    return NextResponse.json(mongoUser)
  } catch (err) {
    console.error("Error fetching user profile:", err)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
