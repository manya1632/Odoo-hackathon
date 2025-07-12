import { NextResponse } from "next/server"
import { UserModel, convertToUserInterface } from "@/lib/db"
import { verifyAuth } from "@/lib/server-auth" // To verify the Firebase ID token

export async function POST(req: Request) {
  try {
    // Verify the Firebase ID token sent from the client
    const { user: firebaseAuthUser, error: authError } = await verifyAuth(req)
    if (authError || !firebaseAuthUser) {
      return NextResponse.json({ error: authError || "Unauthorized" }, { status: 401 })
    }

    const { firebaseUid, name, email, role } = await req.json()

    // Ensure the firebaseUid from the request body matches the authenticated user's UID
    if (firebaseUid !== firebaseAuthUser.firebaseUid) {
      return NextResponse.json({ error: "Firebase UID mismatch" }, { status: 403 })
    }

    if (!firebaseUid || !name || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if user already exists to prevent duplicates
    const existingUser = await UserModel.findOne({ firebaseUid }).lean()
    if (existingUser) {
      return NextResponse.json(convertToUserInterface(existingUser), { status: 200 }) // Return existing user if found
    }

    const newUserDoc = await UserModel.create({
      firebaseUid,
      name,
      email,
      role: role || "user", // Default to 'user' if not provided
    })

    return NextResponse.json(convertToUserInterface(newUserDoc.toObject()), { status: 201 })
  } catch (error) {
    console.error("Error registering MongoDB user:", error)
    return NextResponse.json({ error: "Failed to register user in database" }, { status: 500 })
  }
}
