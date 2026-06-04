import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function POST(request, { params }) {
  try {
    const { id: authorId } = await params
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    if (user.id === authorId) {
      return Response.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      )
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: authorId,
        },
      },
    })

    let isFollowing = false

    if (existingFollow) {
      await prisma.follow.delete({ where: { id: existingFollow.id } })
    } else {
      await prisma.follow.create({
        data: { followerId: user.id, followingId: authorId },
      })

      await prisma.notification.create({
        data: {
          userId: authorId,
          type: "FOLLOW",
          actorId: user.id,
        },
      })

      isFollowing = true
    }

    const followerCount = await prisma.follow.count({
      where: { followingId: authorId },
    })

    return Response.json({ isFollowing, followerCount })
  } catch (error) {
    console.error("POST /api/v1/authors/[id]/follow error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
