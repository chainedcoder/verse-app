import { prisma } from "@/lib/prisma"
import { authenticateRequest } from "@/lib/apiAuth"
import { auth } from "@/auth"

export async function GET(request) {
  try {
    let { user, error } = await authenticateRequest(request)
    if (!user) {
      const session = await auth()
      if (session?.user) {
        user = session.user
        error = null
      }
    }

    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        theme: true,
        immersiveMode: true,
        isPrivateAccount: true,
        emailNotifications: true,
        createdAt: true,
        _count: {
          select: { poems: true, followers: true, following: true },
        },
      },
    })

    return Response.json({
      profile: {
        ...profile,
        poemCount: profile._count.poems,
        followerCount: profile._count.followers,
        followingCount: profile._count.following,
      },
    })
  } catch (error) {
    console.error("GET /api/v1/profile error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    let { user, error } = await authenticateRequest(request)
    if (!user) {
      const session = await auth()
      if (session?.user) {
        user = session.user
        error = null
      }
    }

    if (!user) {
      return Response.json({ error: error || "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, username, bio, location, website, theme, accent, immersiveMode, isPrivateAccount, emailNotifications } = body

    // Fetch existing user to safely merge preferences
    const currentUser = await prisma.user.findUnique({ where: { id: user.id }, select: { preferences: true } })
    const existingPrefs = currentUser?.preferences || {}

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (location !== undefined) updateData.location = location
    if (website !== undefined) updateData.website = website
    if (theme !== undefined) updateData.theme = theme
    if (accent !== undefined) updateData.preferences = { ...existingPrefs, accent }
    if (immersiveMode !== undefined) updateData.immersiveMode = immersiveMode
    if (isPrivateAccount !== undefined) updateData.isPrivateAccount = isPrivateAccount
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        theme: true,
        immersiveMode: true,
        isPrivateAccount: true,
        emailNotifications: true,
      },
    })

    return Response.json({ profile: updated })
  } catch (error) {
    console.error("PUT /api/v1/profile error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
