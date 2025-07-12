export interface User {
  id: string 
  firebaseUid: string 
  name: string
  email: string
  role: "guest" | "user" | "admin"
}

export interface Question {
  id: string 
  title: string
  description: string // HTML content from rich text editor
  tags: string[]
  authorId: string
  createdAt: string
  updatedAt: string
  acceptedAnswerId?: string 
}

export interface Answer {
  id: string 
  questionId: string
  content: string
  authorId: string 
  upvotes: string[] 
  downvotes: string[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string 
  userId: string 
  type: "answer" | "comment" | "mention"
  message: string
  link: string
  read: boolean
  createdAt: string
}

// CURRENT_USER_ID will now be dynamically fetched from the authenticated session.
// This constant is no longer used directly for user identification in actions.
// It's kept here for type consistency if needed elsewhere, but its value will be dynamic.
export const CURRENT_USER_ID = "dynamic_user_id"
