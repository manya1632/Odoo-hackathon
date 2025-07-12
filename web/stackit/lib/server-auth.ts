import { authAdmin } from "@/lib/firebase/admin"
import { UserModel, convertToUserInterface } from "@/lib/db" // Import UserModel and convertToUserInterface
import type { User } from "@/lib/types"

// --- Server-side Auth Middleware/Helper ---

export async function verifyAuth(request: Request): Promise<{ user: User | null; error?: string }> {
  const authorizationHeader = request.headers.get("Authorization")

  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return { user: null, error: "No authentication token provided" }
  }

  const idToken = authorizationHeader.split("Bearer ")[1]

  try {
    const decodedToken = await authAdmin.verifyIdToken(idToken)
    const firebaseUid = decodedToken.uid

    // Fetch user from MongoDB and convert to User interface
    const userDoc = await UserModel.findOne({ firebaseUid }).lean()
    if (!userDoc) {
      return { user: null, error: "User not found in database" }
    }
    return { user: convertToUserInterface(userDoc) } // Convert to User interface
  } catch (error) {
    console.error("Error verifying Firebase ID token:", error)
    return { user: null, error: "Invalid or expired token" }
  }
}
