import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()

    if (!q) {
      return Response.json({ poems: [] })
    }

    const poems = await prisma.poem.findMany({
      where: {
        status: "PUBLISHED",
        isPrivate: false,
        OR: [
          { title: { contains: q } },
          { author: { name: { contains: q } } },
        ],
      },
      select: {
        id: true,
        title: true,
        excerpt: true,
        createdAt: true,
        images: { select: { id: true, url: true, alt: true } },
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        tags: { select: { id: true, name: true } },
        _count: { select: { likes: true, comments: true } },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    })

    return Response.json({
      poems: poems.map((p) => ({
        ...p,
        likeCount: p._count.likes,
        commentCount: p._count.comments,
      })),
    })
  } catch (error) {
    console.error("GET /api/v1/poems/search error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
