import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function POST(request, { params }) {
  try {
    const { id: poemId } = await params
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const poem = await prisma.poem.findUnique({
      where: { id: poemId },
      select: { authorId: true },
    })

    if (!poem) {
      return Response.json({ error: "Poem not found" }, { status: 404 })
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        poemId_userId: { poemId, userId: user.id },
      },
    })

    let isLiked = false

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } })
    } else {
      await prisma.like.create({
        data: { poemId, userId: user.id },
      })

      if (poem.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: poem.authorId,
            type: "LIKE",
            actorId: user.id,
            poemId,
          },
        })
      }

      isLiked = true
    }

    const likeCount = await prisma.like.count({ where: { poemId } })

    return Response.json({ isLiked, likeCount })
  } catch (error) {
    console.error("POST /api/v1/poems/[id]/like error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
