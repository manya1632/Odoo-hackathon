import { NextResponse } from "next/server"
import { getNotificationsForUser, getUnreadNotificationCount, markNotificationAsRead } from "@/lib/db"
import { CURRENT_USER_ID } from "@/lib/types"

export async function GET() {
  try {
    // In a real app, userId would come from authenticated session
    const userId = CURRENT_USER_ID
    const notifications = await getNotificationsForUser(userId)
    const unreadCount = await getUnreadNotificationCount(userId)
    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    await markNotificationAsRead(id)
    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
