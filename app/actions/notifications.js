"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getNotifications() {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.user.id

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        poem: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false }
    })

    return { success: true, notifications: JSON.parse(JSON.stringify(notifications)), unreadCount }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { success: false, error: "Failed to fetch notifications" }
  }
}

export async function markNotificationsAsRead() {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: "Not authenticated" }
  }

  const userId = session.user.id

  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    })
    
    return { success: true }
  } catch (error) {
    console.error("Error marking notifications as read:", error)
    return { success: false, error: "Failed to mark as read" }
  }
}
