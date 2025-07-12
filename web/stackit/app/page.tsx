import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-128px)] text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to StackIt</h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
        Your minimal Q&A forum for collaborative learning and structured knowledge sharing.
      </p>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/questions">View Questions</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/questions/ask">Ask a Question</Link>
        </Button>
      </div>
    </div>
  );
}
