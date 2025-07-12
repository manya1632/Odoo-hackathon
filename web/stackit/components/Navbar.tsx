"use client"

import Link from "next/link"
import { Bell, MessageSquare, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import type { Notification } from "@/lib/types"
import { onClientAuthStateChanged, logout } from "@/lib/client-auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function Navbar() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onClientAuthStateChanged(async (user) => {
      setCurrentUser(user)
      if (user) {
        const idToken = await user.getIdToken()
        const res = await fetch("/api/notifications", {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        })
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications)
          setUnreadCount(data.unreadCount)
        }
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    })
    return () => unsubscribe()
  }, [])

  const handleNotificationClick = async (notificationId: string, link: string) => {
    if (!currentUser) return

    const idToken = await currentUser.getIdToken()
    await fetch(`/api/notifications?id=${notificationId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0))
    router.push(link)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Logged out", {
        description: "You have been successfully logged out.",
      })
      router.push("/")
    } catch (error: any) {
      toast.error("Logout failed", {
        description: error.message || "An error occurred during logout.",
      })
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <span className="text-xl">StackIt</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link href="/questions" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Questions
          </Link>
          {currentUser && (
            <Link
              href="/questions/ask"
              className="text-sm font-medium hover:underline underline-offset-4"
              prefetch={false}
            >
              Ask Question
            </Link>
          )}
          {currentUser && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <DropdownMenuItem className="text-muted-foreground">No new notifications</DropdownMenuItem>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem
                      key={notification.id}
                      className={`flex items-start gap-2 ${!notification.read ? "bg-accent font-medium" : ""}`}
                      onClick={() => handleNotificationClick(notification.id, notification.link)}
                    >
                      {notification.type === "answer" && <MessageSquare className="h-4 w-4 mt-1 text-blue-500" />}
                      {notification.type === "mention" && <User className="h-4 w-4 mt-1 text-green-500" />}
                      <div className="flex-1">
                        <p className="text-sm leading-snug">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center">
                  <Link href="#" className="text-sm text-primary hover:underline">
                    View All
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentUser ? (
                <>
                  <DropdownMenuLabel>{currentUser.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/auth">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth">Sign Up</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  )
}
