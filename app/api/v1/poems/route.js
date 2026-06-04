import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request) {
  try {
    const { user } = await authenticateRequest(request)
    const userId = user?.id

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get("cursor")
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50)
    const tag = searchParams.get("tag") || "all"
    const featured = searchParams.get("featured") === "true"

    const where = {
      status: { not: "DELETED" },
      featured,
      ...(userId
        ? {
            OR: [{ isPrivate: false }, { authorId: userId }],
          }
        : { isPrivate: false }),
    }

    if (tag === "following") {
      if (!userId) {
        return Response.json({ poems: [], nextCursor: null })
      }
      where.author = {
        followers: {
          some: { followerId: userId },
        },
      }
    } else if (tag !== "all") {
      where.tags = {
        some: { name: tag },
      }
    }

    const queryOptions = {
      where,
      take: limit + 1,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
          },
        },
        tags: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, alt: true } },
        _count: { select: { likes: true, comments: true } },
      },
    }

    if (cursor) {
      queryOptions.cursor = { id: cursor }
      queryOptions.skip = 1
    }

    const poems = await prisma.poem.findMany(queryOptions)

    let nextCursor = null
    if (poems.length > limit) {
      const nextItem = poems.pop()
      nextCursor = nextItem.id
    }

    // Add isLiked flag if authenticated
    let likedPoemIds = new Set()
    if (userId && poems.length > 0) {
      const likes = await prisma.like.findMany({
        where: {
          userId,
          poemId: { in: poems.map((p) => p.id) },
        },
        select: { poemId: true },
      })
      likedPoemIds = new Set(likes.map((l) => l.poemId))
    }

    const result = poems.map((poem) => ({
      ...poem,
      isLiked: likedPoemIds.has(poem.id),
      likeCount: poem._count.likes,
      commentCount: poem._count.comments,
    }))

    return Response.json({ poems: result, nextCursor })
  } catch (error) {
    console.error("GET /api/v1/poems error:", error)
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
    const tagsArray = (tags || [])
      .map((t) => t.trim())
      .filter(Boolean)

    const poem = await prisma.poem.create({
      data: {
        title,
        excerpt: generatedExcerpt,
        fullText,
        status: status === "DRAFT" ? "DRAFT" : "PUBLISHED",
        isPrivate: isPrivate || false,
        vibeConfig: vibeConfig || [],
        tags: {
          connectOrCreate: tagsArray.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
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
        tags: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, alt: true } },
        _count: { select: { likes: true, comments: true } },
      },
    })

    return Response.json({ poem }, { status: 201 })
  } catch (error) {
    console.error("POST /api/v1/poems error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
