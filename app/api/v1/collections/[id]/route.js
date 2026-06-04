import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const { user } = await authenticateRequest(request)

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, username: true, image: true },
        },
        poems: {
          where: { status: { not: "DELETED" } },
          include: {
            author: {
              select: { id: true, name: true, username: true, image: true },
            },
            tags: { select: { id: true, name: true } },
            images: { select: { id: true, url: true, alt: true } },
            _count: { select: { likes: true, comments: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!collection || collection.status === "DELETED") {
      return Response.json({ error: "Collection not found" }, { status: 404 })
    }

    if (!collection.isPublic && collection.authorId !== user?.id) {
      return Response.json({ error: "Collection not found" }, { status: 404 })
    }

    return Response.json({
      collection: {
        ...collection,
        poems: collection.poems.map((p) => ({
          ...p,
          likeCount: p._count.likes,
          commentCount: p._count.comments,
        })),
      },
    })
  } catch (error) {
    console.error("GET /api/v1/collections/[id] error:", error)
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

    const collection = await prisma.collection.findUnique({ where: { id } })
    if (!collection || collection.authorId !== user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, isPublic } = body

    if (!name || !name.trim()) {
      return Response.json(
        { error: "Collection name is required" },
        { status: 400 }
      )
    }

    const updated = await prisma.collection.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isPublic: isPublic !== false,
      },
    })

    return Response.json({ collection: updated })
  } catch (error) {
    console.error("PUT /api/v1/collections/[id] error:", error)
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

    const collection = await prisma.collection.findUnique({ where: { id } })
    if (!collection || collection.authorId !== user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 403 })
    }

    await prisma.collection.update({
      where: { id },
      data: { status: "DELETED" },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error("DELETE /api/v1/collections/[id] error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
