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
    return { success: true, reports }
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
    revalidatePath("/admin")
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
    revalidatePath("/admin")
    return { success: true }
  } catch (error) {
    console.error("Error deleting poem:", error)
    return { error: "Failed to delete poem" }
  }
}
