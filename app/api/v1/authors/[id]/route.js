import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { user } = await authenticateRequest(request)
    const userId = user?.id

    const author = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        createdAt: true,
        _count: {
          select: { poems: true, followers: true, following: true },
        },
      },
    })

    if (!author) {
      return Response.json({ error: "Author not found" }, { status: 404 })
    }

    // Get author's poems
    const poems = await prisma.poem.findMany({
      where: {
        authorId: id,
        status: { not: "DELETED" },
        ...(userId === id ? {} : { isPrivate: false }),
      },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        tags: { select: { id: true, name: true } },
        images: { select: { id: true, url: true, alt: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    let isFollowing = false
    if (userId && userId !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: id,
          },
        },
      })
      isFollowing = !!follow
    }

    return Response.json({
      author: {
        ...author,
        poemCount: author._count.poems,
        followerCount: author._count.followers,
        followingCount: author._count.following,
        isFollowing,
      },
      poems: poems.map((p) => ({
        ...p,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
      })),
    })
  } catch (error) {
    console.error("GET /api/v1/authors/[id] error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
