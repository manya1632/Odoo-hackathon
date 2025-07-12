import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { Toaster } from "sonner" // ✅ Use sonner's toaster

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "StackIt - Minimal Q&A Forum",
  description: "A minimal question-and-answer platform for collaborative learning and structured knowledge sharing.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-64px)]">{children}</main>
        <Toaster richColors position="top-center" /> {/* ✅ Sonner's Toaster */}
      </body>
    </html>
  )
}
