export interface User {
  id: string
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
  content: string // HTML content from rich text editor
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

export const CURRENT_USER_ID = "user1"
