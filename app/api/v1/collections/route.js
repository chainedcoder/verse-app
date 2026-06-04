import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request) {
  try {
    const { user, error } = await authenticateRequest(request)
    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const collections = await prisma.collection.findMany({
      where: {
        authorId: user.id,
        status: "ACTIVE",
      },
      include: {
        _count: { select: { poems: true } },
        poems: {
          take: 1,
          select: {
            images: { take: 1, select: { url: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    })

    return Response.json({
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        isPublic: c.isPublic,
        poemCount: c._count.poems,
        coverImage: c.poems[0]?.images[0]?.url || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    })
  } catch (error) {
    console.error("GET /api/v1/collections error:", error)
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
    const { name, description, isPublic } = body

    if (!name || !name.trim()) {
      return Response.json(
        { error: "Collection name is required" },
        { status: 400 }
      )
    }

    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic !== false,
        authorId: user.id,
      },
    })

    return Response.json({ collection }, { status: 201 })
  } catch (error) {
    console.error("POST /api/v1/collections error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
