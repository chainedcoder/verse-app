import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request, { params }) {
  try {
    const { id: poemId } = await params

    const comments = await prisma.comment.findMany({
      where: { poemId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json({ comments })
  } catch (error) {
    console.error("GET /api/v1/poems/[id]/comments error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request, { params }) {
  try {
    const { id: poemId } = await params
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return Response.json(
        { error: "Comment content is required" },
        { status: 400 }
      )
    }

    const poem = await prisma.poem.findUnique({
      where: { id: poemId },
      select: { authorId: true },
    })

    if (!poem) {
      return Response.json({ error: "Poem not found" }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        poemId,
        authorId: user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })

    // Notify poem author
    if (poem.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: poem.authorId,
          type: "COMMENT",
          actorId: user.id,
          poemId,
        },
      })
    }

    return Response.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("POST /api/v1/poems/[id]/comments error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
