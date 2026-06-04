import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { poems: true } },
      },
      orderBy: { poems: { _count: "desc" } },
      take: 50,
    })

    return Response.json({
      tags: tags.map((t) => ({
        id: t.id,
        name: t.name,
        poemCount: t._count.poems,
      })),
    })
  } catch (error) {
    console.error("GET /api/v1/tags error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
