"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { login, signup } from "@/lib/client-auth"
import { toast } from "sonner" // ✅ Sonner import

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (isLogin) {
        await login(email, password)
        toast.success("Logged in successfully!", {
          description: "Welcome back to StackIt.",
        })
      } else {
        await signup(email, password, name)
        toast.success("Signed up successfully!", {
          description: "Your account has been created.",
        })
      }
      router.push("/questions")
    } catch (error: any) {
      toast.error("Authentication failed.", {
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{isLogin ? "Login" : "Sign Up"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your credentials to access your account." : "Create a new account to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (isLogin ? "Logging In..." : "Signing Up...") : isLogin ? "Login" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="p-0 h-auto">
            {isLogin ? "Sign Up" : "Login"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
