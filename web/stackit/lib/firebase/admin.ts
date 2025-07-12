import * as admin from "firebase-admin"

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Handle newlines
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    })
  } catch (error: any) {
    console.error("Firebase Admin initialization error", error.stack)
  }
}

const authAdmin = admin.auth()
const firestoreAdmin = admin.firestore()

export { authAdmin, firestoreAdmin }
