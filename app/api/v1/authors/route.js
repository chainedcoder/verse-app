import { prisma } from "@/lib/prisma"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

    const authors = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        _count: {
          select: { poems: true, followers: true },
        },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    return Response.json({
      authors: authors.map((a) => ({
        ...a,
        poemCount: a._count.poems,
        followerCount: a._count.followers,
      })),
    })
  } catch (error) {
    console.error("GET /api/v1/authors error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
