import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { user } = await authenticateRequest(request)
    const userId = user?.id

    const poem = await prisma.poem.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            _count: {
              select: { poems: true, followers: true, following: true },
            },
          },
        },
        tags: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, alt: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    if (!poem || poem.status === "DELETED") {
      return Response.json({ error: "Poem not found" }, { status: 404 })
    }

    // Check private access
    if (poem.isPrivate && poem.authorId !== userId) {
      return Response.json({ error: "Poem not found" }, { status: 404 })
    }

    // Check if user liked this poem
    let isLiked = false
    let isFollowingAuthor = false
    if (userId) {
      const [like, follow] = await Promise.all([
        prisma.like.findUnique({
          where: { poemId_userId: { poemId: id, userId } },
        }),
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: poem.authorId,
            },
          },
        }),
      ])
      isLiked = !!like
      isFollowingAuthor = !!follow
    }

    return Response.json({
      poem: {
        ...poem,
        isLiked,
        isFollowingAuthor,
        likeCount: poem._count.likes,
        commentCount: poem._count.comments,
      },
    })
  } catch (error) {
    console.error("GET /api/v1/poems/[id] error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const poem = await prisma.poem.findUnique({ where: { id } })
    if (!poem || poem.authorId !== user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { title, excerpt, fullText, tags, status, isPrivate, vibeConfig } = body

    if (!title || !fullText) {
      return Response.json(
        { error: "Title and body are required" },
        { status: 400 }
      )
    }

    const generatedExcerpt =
      excerpt || fullText.split("\n").slice(0, 2).join("\n")
    const tagsArray = (tags || []).map((t) => t.trim()).filter(Boolean)

    const updated = await prisma.poem.update({
      where: { id },
      data: {
        title,
        excerpt: generatedExcerpt,
        fullText,
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        isPrivate: isPrivate || false,
        vibeConfig: vibeConfig || [],
        tags: {
          set: [],
          connectOrCreate: tagsArray.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        tags: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, alt: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return Response.json({ poem: updated })
  } catch (error) {
    console.error("PUT /api/v1/poems/[id] error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const poem = await prisma.poem.findUnique({ where: { id } })
    if (!poem || poem.authorId !== user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.poem.update({
      where: { id },
      data: { status: "DELETED" },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/v1/poems/[id] error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
