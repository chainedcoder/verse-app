import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request) {
  try {
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      include: {
        actor: {
          select: { id: true, name: true, username: true, image: true },
        },
        poem: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })

    return Response.json({ notifications, unreadCount })
  } catch (error) {
    console.error("GET /api/v1/notifications error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("POST /api/v1/notifications error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
