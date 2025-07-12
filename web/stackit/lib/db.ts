import type { Answer, Notification, Question, User } from "./types"

// --- Mock Data ---
const users: User[] = [
  { id: 'user1', name: 'Alice', email: 'alice@example.com', role: 'user' },
  { id: 'user2', name: 'Bob', email: 'bob@example.com', role: 'user' },
  { id: 'admin1', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
]

const questions: Question[] = [
  {
    id: 'q1',
    title: 'How to set up Next.js with Tailwind CSS?',
    description: `<p>I'm starting a new Next.js project and want to use Tailwind CSS. What's the best way to set it up with the App Router?</p>`,
    tags: ['Next.js', 'Tailwind CSS'],
    authorId: 'user1',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'q2',
    title: 'Understanding React Server Components',
    description: `<p>Can someone explain the core concept of React Server Components and when to use them versus Client Components?</p>`,
    tags: ['React', 'Next.js', 'Server Components'],
    authorId: 'user2',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    acceptedAnswerId: 'a2',
  },
  {
    id: 'q3',
    title: 'Best practices for API routes in Next.js 15?',
    description: `<p>With Next.js 15, what are the recommended best practices for structuring and securing API routes?</p>`,
    tags: ['Next.js', 'API Routes'],
    authorId: 'user1',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
]

const answers: Answer[] = [
  {
    id: 'a1',
    questionId: 'q1',
    content: `<p>You can use <code>npx create-next-app@latest</code> and select Tailwind CSS during setup. It handles most of the configuration for you!</p>`,
    authorId: 'user2',
    upvotes: ['user1'],
    downvotes: [],
    createdAt: new Date(Date.now() - 80000000).toISOString(),
    updatedAt: new Date(Date.now() - 80000000).toISOString(),
  },
  {
    id: 'a2',
    questionId: 'q2',
    content: `<p>Server Components render on the server, reducing client-side JavaScript and improving initial page load. Client Components are for interactivity and client-side state.</p>`,
    authorId: 'user1',
    upvotes: ['user2'],
    downvotes: [],
    createdAt: new Date(Date.now() - 3000000).toISOString(),
    updatedAt: new Date(Date.now() - 3000000).toISOString(),
  },
  {
    id: 'a3',
    questionId: 'q3',
    content: `<p>Use Route Handlers (<code>route.ts</code>) for API routes. They are powerful and integrate well with the App Router. Consider using Zod for input validation.</p>`,
    authorId: 'user2',
    upvotes: [],
    downvotes: [],
    createdAt: new Date(Date.now() - 1000000).toISOString(),
    updatedAt: new Date(Date.now() - 1000000).toISOString(),
  },
]

const notifications: Notification[] = [
  {
    id: 'n1',
    userId: 'user1',
    type: 'answer',
    message: 'Bob answered your question "Understanding React Server Components"',
    link: '/questions/q2',
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'n2',
    userId: 'user2',
    type: 'mention',
    message: 'Alice mentioned you in a comment.',
    link: '/questions/q1',
    read: true,
    createdAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    id: 'n3',
    userId: 'user1',
    type: 'answer',
    message: 'Bob answered your question "How to set up Next.js with Tailwind CSS?"',
    link: '/questions/q1',
    read: false,
    createdAt: new Date().toISOString(),
  },
]

// --- Helper Functions ---
export const getQuestions = () =>
  questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export const getQuestionById = (id: string) => questions.find((q) => q.id === id)

export const createQuestion = (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newQuestion: Question = {
    ...question,
    id: `q${questions.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  questions.unshift(newQuestion)
  return newQuestion
}

export const getAnswersForQuestion = (questionId: string) =>
  answers
    .filter((a) => a.questionId === questionId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

export const createAnswer = (
  answer: Omit<Answer, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'downvotes'>
) => {
  const newAnswer: Answer = {
    ...answer,
    id: `a${answers.length + 1}`,
    upvotes: [],
    downvotes: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  answers.push(newAnswer)
  return newAnswer
}

export const getNotificationsForUser = (userId: string) =>
  notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

export const getUnreadNotificationCount = (userId: string) =>
  notifications.filter((n) => n.userId === userId && !n.read).length

export const markNotificationAsRead = (id: string) => {
  const notification = notifications.find((n) => n.id === id)
  if (notification) notification.read = true
}

export const getUserById = (id: string) => users.find((u) => u.id === id)

export const toggleVote = (answerId: string, userId: string, type: 'up' | 'down') => {
  const answer = answers.find((a) => a.id === answerId)
  if (!answer) return null

  if (type === 'up') {
    if (answer.upvotes.includes(userId)) {
      answer.upvotes = answer.upvotes.filter((id) => id !== userId)
    } else {
      answer.upvotes.push(userId)
      answer.downvotes = answer.downvotes.filter((id) => id !== userId)
    }
  } else {
    if (answer.downvotes.includes(userId)) {
      answer.downvotes = answer.downvotes.filter((id) => id !== userId)
    } else {
      answer.downvotes.push(userId)
      answer.upvotes = answer.upvotes.filter((id) => id !== userId)
    }
  }

  answer.updatedAt = new Date().toISOString()
  return answer
}

export const acceptAnswer = (questionId: string, answerId: string) => {
  const question = questions.find((q) => q.id === questionId)
  if (question) {
    question.acceptedAnswerId = answerId
    question.updatedAt = new Date().toISOString()
    return question
  }
  return null
}
