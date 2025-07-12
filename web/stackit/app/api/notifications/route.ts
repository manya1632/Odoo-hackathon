import { NextResponse } from "next/server"
import { NotificationModel, convertToNotificationInterface } from "@/lib/db"
import { verifyAuth } from "@/lib/server-auth" // UPDATED IMPORT

export async function GET(req: Request) {
  try {
    const { user, error } = await verifyAuth(req) // Verify authentication
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const notificationDocs = await NotificationModel.find({ userId: user.id }).sort({ createdAt: -1 }).lean()
    const notifications = notificationDocs.map(convertToNotificationInterface)

    const unreadCount = await NotificationModel.countDocuments({ userId: user.id, read: false })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { user, error } = await verifyAuth(req) // Verify authentication
    if (error || !user) {
      return NextResponse.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 })
    }

    const notification = await NotificationModel.findById(id)
    if (!notification || notification.userId.toString() !== user.id.toString()) {
      return NextResponse.json({ error: "Unauthorized to update this notification" }, { status: 403 })
    }

    notification.read = true
    await notification.save()

    return NextResponse.json({ message: "Notification marked as read" })
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
