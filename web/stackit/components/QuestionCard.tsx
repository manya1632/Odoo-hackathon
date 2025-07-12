import Link from "next/link"
import type { Question } from "@/lib/types"
import { formatDistanceToNow } from "date-fns" 

interface QuestionCardProps {
  question: Question
  authorName: string
}

export default function QuestionCard({ question, authorName }: QuestionCardProps) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <Link href={`/questions/${question.id}`} className="block">
        <h3 className="text-xl font-semibold mb-2 hover:underline">{question.title}</h3>
      </Link>
      <div className="flex flex-wrap gap-2 mb-4">
        {question.tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Asked by {authorName}</span>
        <span>{formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
      </div>
    </div>
  )
}
