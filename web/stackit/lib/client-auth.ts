"use client" // This file is explicitly client-side

import { auth } from "@/lib/firebase/client"
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from "firebase/auth"
import type { User } from "@/lib/types" // Only import the type, not the model

// --- Client-side Auth Functions ---

export async function signup(email: string, password: string, name: string): Promise<User | null> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // After successful Firebase signup, call a server API to create user in MongoDB
    const idToken = await firebaseUser.getIdToken()
    const res = await fetch("/api/auth/register-mongo-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`, // Send token for server-side verification
      },
      body: JSON.stringify({
        firebaseUid: firebaseUser.uid,
        name,
        email: firebaseUser.email,
        role: "user", // Default role
      }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to create user profile in database.")
    }

    const newUser = await res.json()
    return newUser as User // Return the created MongoDB user
  } catch (error) {
    console.error("Firebase signup or MongoDB user creation error:", error)
    throw error
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // After successful Firebase login, fetch user from MongoDB via API
    const idToken = await firebaseUser.getIdToken()
    const res = await fetch("/api/auth/user-profile", {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to fetch user profile from database.")
    }

    const userDoc = await res.json()
    return userDoc as User // Return the fetched MongoDB user
  } catch (error) {
    console.error("Firebase login or MongoDB user fetch error:", error)
    throw error
  }
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export function onClientAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback)
}
