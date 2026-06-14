"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// Helper to verify if the current user is an ADMIN or MODERATOR
async function verifyAdminOrMod() {
  const session = await auth()
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true }
  })

  if (!user || user.status === "BANNED") return false
  
  return user.role === "ADMIN" || user.role === "MODERATOR"
}

// Helper to verify if current user is ADMIN only
async function verifyAdmin() {
  const session = await auth()
  if (!session?.user) return false

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true }
  })

  if (!user || user.status === "BANNED") return false
  
  return user.role === "ADMIN"
}

export async function fetchPendingReports() {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    const reports = await prisma.report.findMany({
      where: { status: "PENDING" },
      include: {
        reporter: { select: { id: true, name: true, image: true } },
        reportedUser: { select: { id: true, name: true, image: true } },
        reportedPoem: { select: { id: true, title: true, excerpt: true } },
        reportedComment: { select: { id: true, content: true } }
      },
      orderBy: { createdAt: "asc" }
    })
    return { success: true, reports: JSON.parse(JSON.stringify(reports)) }
  } catch (error) {
    console.error("Error fetching reports:", error)
    return { error: "Failed to fetch reports" }
  }
}

export async function updateReportStatus(reportId, status) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }
  
  if (!["RESOLVED", "DISMISSED"].includes(status)) {
    return { error: "Invalid status" }
  }

  try {
    await prisma.report.update({
      where: { id: reportId },
      data: { status }
    })
    revalidatePath("/admin/reports")
    return { success: true }
  } catch (error) {
    console.error("Error updating report status:", error)
    return { error: "Failed to update report" }
  }
}

export async function updateUserStatus(userId, status) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  if (!["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
    return { error: "Invalid status" }
  }

  try {
    // Prevent banning admins if requester is a moderator
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true }})
    if (targetUser.role === "ADMIN" && !(await verifyAdmin())) {
      return { error: "Moderators cannot ban administrators" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status }
    })
    revalidatePath("/admin/users")
    revalidatePath(`/author/${userId}`)
    return { success: true }
  } catch (error) {
    console.error("Error updating user status:", error)
    return { error: "Failed to update user status" }
  }
}

export async function updateUserRole(userId, role) {
  if (!(await verifyAdmin())) return { error: "Only administrators can change roles" }

  if (!["USER", "MODERATOR", "ADMIN"].includes(role)) {
    return { error: "Invalid role" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role }
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    return { error: "Failed to update user role" }
  }
}

export async function togglePoemFeatured(poemId, featured) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    await prisma.poem.update({
      where: { id: poemId },
      data: { featured }
    })
    revalidatePath(`/poem/${poemId}`)
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error toggling poem feature status:", error)
    return { error: "Failed to update poem" }
  }
}

export async function deletePoemAdmin(poemId) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    await prisma.poem.update({
      where: { id: poemId },
      data: { status: "DELETED" }
    })
    revalidatePath("/admin/content")
    return { success: true }
  } catch (error) {
    console.error("Error deleting poem:", error)
    return { error: "Failed to delete poem" }
  }
}

export async function fetchDashboardMetrics() {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    const totalUsers = await prisma.user.count()
    const activeUsers = await prisma.user.count({ where: { status: "ACTIVE" } })
    const totalPoems = await prisma.poem.count({ where: { status: "PUBLISHED" } })
    const pendingReports = await prisma.report.count({ where: { status: "PENDING" } })
    const recentSignups = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true, image: true }
    })

    return { 
      success: true, 
      metrics: { totalUsers, activeUsers, totalPoems, pendingReports },
      recentSignups: JSON.parse(JSON.stringify(recentSignups)) 
    }
  } catch (error) {
    console.error("Error fetching metrics:", error)
    return { error: "Failed to fetch metrics" }
  }
}

export async function fetchAllPoems(searchTerm = "") {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    const poems = await prisma.poem.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } }
        ]
      },
      include: {
        author: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, poems: JSON.parse(JSON.stringify(poems)) }
  } catch (error) {
    console.error("Error fetching poems:", error)
    return { error: "Failed to fetch poems" }
  }
}

export async function deleteUserNuclear(userId) {
  if (!(await verifyAdmin())) return { error: "Only administrators can permanently delete users" }

  try {
    await prisma.user.delete({
      where: { id: userId }
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Failed to delete user" }
  }
}

export async function fetchTagsAdmin() {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: { select: { poems: true } }
      },
      orderBy: { poems: { _count: "desc" } }
    })
    return { success: true, tags: JSON.parse(JSON.stringify(tags)) }
  } catch (error) {
    console.error("Error fetching tags:", error)
    return { error: "Failed to fetch tags" }
  }
}

export async function renameTagAdmin(tagId, newName) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    await prisma.tag.update({
      where: { id: tagId },
      data: { name: newName }
    })
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    console.error("Error renaming tag:", error)
    return { error: "Failed to rename tag" }
  }
}

export async function deleteTagAdmin(tagId) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    await prisma.tag.delete({
      where: { id: tagId }
    })
    revalidatePath("/admin/tags")
    return { success: true }
  } catch (error) {
    console.error("Error deleting tag:", error)
    return { error: "Failed to delete tag" }
  }
}
