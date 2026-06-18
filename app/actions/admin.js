"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

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
    // API Safeguard: Block operations on deleted users
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, status: true }})
    if (!targetUser) return { error: "User not found" }
    if (targetUser.status === "DELETED") {
      return { error: "Cannot modify a deleted user" }
    }

    // Prevent banning admins if requester is a moderator
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
    // API Safeguard: Block operations on deleted users
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { status: true }})
    if (!targetUser) return { error: "User not found" }
    if (targetUser.status === "DELETED") {
      return { error: "Cannot modify a deleted user" }
    }

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

export async function createUserAdmin({ name, surname, email, password, role, permissions }) {
  if (!(await verifyAdmin())) return { error: "Only administrators can create users" }
  
  if (!name || !email || !password || !role) {
    return { error: "All fields are required" }
  }
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return { error: "A user with this email already exists" }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const fullName = surname ? `${name} ${surname}` : name;
    
    const newUser = await prisma.user.create({
      data: {
        name: fullName,
        email,
        password: hashedPassword,
        role,
        status: "ACTIVE",
        permissions
      }
    })
    revalidatePath("/admin/users")
    return { success: true, user: JSON.parse(JSON.stringify(newUser)) }
  } catch (error) {
    console.error("Error creating user admin:", error)
    return { error: "Failed to create user" }
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
    revalidatePath(`/poem/${poemId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting poem:", error)
    return { error: "Failed to delete poem" }
  }
}

export async function reinstatePoemAdmin(poemId) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  try {
    await prisma.poem.update({
      where: { id: poemId },
      data: { status: "PUBLISHED" }
    })
    revalidatePath("/admin/content")
    revalidatePath(`/poem/${poemId}`)
    return { success: true }
  } catch (error) {
    console.error("Error reinstating poem:", error)
    return { error: "Failed to reinstate poem" }
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

export async function deleteUser(userId) {
  if (!(await verifyAdmin())) return { error: "Only administrators can delete users" }

  try {
    // API Safeguard: Block operations on deleted users
    const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { status: true }})
    if (!targetUser) return { error: "User not found" }
    if (targetUser.status === "DELETED") {
      return { error: "User is already deleted" }
    }

    // Soft delete: Anonymize user account
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: "[deleted]",
        email: `deleted-${userId}@deleted.local`,
        status: "DELETED",
        role: "USER"
      }
    })

    // Delete user's poems, likes, follows, but comments are preserved as [deleted]
    await prisma.poem.updateMany({
      where: { authorId: userId },
      data: { status: "DELETED" }
    })
    
    await prisma.like.deleteMany({
      where: { userId }
    })

    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId },
          { followingId: userId }
        ]
      }
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    return { error: "Failed to delete user" }
  }
}

export async function deleteUserNuclear(userId) {
  if (!(await verifyAdmin())) return { error: "Only administrators can permanently delete users" }

  try {
    // Permanently delete user and cascade
    await prisma.user.delete({
      where: { id: userId }
    })
    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error permanently deleting user:", error)
    return { error: "Failed to permanently delete user" }
  }
}

export async function deleteUsersBulk(userIds) {
  const session = await (await import("@/auth")).auth()
  if (!(await verifyAdmin())) return { error: "Only administrators can delete users" }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { error: "No users selected" }
  }

  // Prevent self-deletion
  const filteredIds = userIds.filter(id => id !== session?.user?.id)
  if (filteredIds.length === 0) {
    return { error: "Cannot delete your own account" }
  }

  try {
    // API Safeguard: Filter out already deleted users to avoid double processing
    const activeUsers = await prisma.user.findMany({
      where: { id: { in: filteredIds }, status: { not: "DELETED" } },
      select: { id: true }
    })
    const activeIds = activeUsers.map(u => u.id)
    if (activeIds.length === 0) return { success: true, deletedCount: 0 }

    // Soft delete active users
    await prisma.$transaction(
      activeIds.map(id =>
        prisma.user.update({
          where: { id },
          data: {
            name: "[deleted]",
            email: `deleted-${id}@deleted.local`,
            status: "DELETED",
            role: "USER"
          }
        })
      )
    )

    // Delete their content
    await prisma.poem.updateMany({
      where: { authorId: { in: activeIds } },
      data: { status: "DELETED" }
    })

    await prisma.like.deleteMany({
      where: { userId: { in: activeIds } }
    })

    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: { in: activeIds } },
          { followingId: { in: activeIds } }
        ]
      }
    })

    revalidatePath("/admin/users")
    return { success: true, deletedCount: activeIds.length }
  } catch (error) {
    console.error("Error bulk soft deleting users:", error)
    return { error: "Failed to delete users" }
  }
}

export async function deleteUsersNuclearBulk(userIds) {
  const session = await (await import("@/auth")).auth()
  if (!(await verifyAdmin())) return { error: "Only administrators can permanently delete users" }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return { error: "No users selected" }
  }

  // Prevent self-deletion
  const filteredIds = userIds.filter(id => id !== session?.user?.id)
  if (filteredIds.length === 0) {
    return { error: "Cannot delete your own account" }
  }

  try {
    // Delete in a transaction for atomicity
    await prisma.$transaction(
      filteredIds.map(id => prisma.user.delete({ where: { id } }))
    )
    revalidatePath("/admin/users")
    return { success: true, deletedCount: filteredIds.length }
  } catch (error) {
    console.error("Error bulk deleting users:", error)
    return { error: "Failed to delete users. Some may not exist." }
  }
}

export async function deletePoemsAdminBulk(poemIds) {
  if (!(await verifyAdminOrMod())) return { error: "Unauthorized" }

  if (!Array.isArray(poemIds) || poemIds.length === 0) {
    return { error: "No poems selected" }
  }

  try {
    await prisma.poem.updateMany({
      where: { id: { in: poemIds } },
      data: { status: "DELETED" }
    })
    revalidatePath("/admin/content")
    return { success: true, deletedCount: poemIds.length }
  } catch (error) {
    console.error("Error bulk deleting poems:", error)
    return { error: "Failed to delete poems" }
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

// 🔐 Permission Group Actions
export async function fetchPermissionGroups() {
  try {
    const groups = await prisma.permissionGroup.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { users: true } } }
    })
    return { success: true, groups: JSON.parse(JSON.stringify(groups)) }
  } catch (error) {
    console.error("Error fetching permission groups:", error)
    return { error: "Failed to fetch permission groups" }
  }
}

export async function createPermissionGroup({ name, color, permissions }) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" }
  if (!name) return { error: "Name is required" }

  try {
    const group = await prisma.permissionGroup.create({
      data: {
        name,
        color: color || "blue",
        permissions: permissions || {}
      }
    })
    revalidatePath("/admin/roles")
    return { success: true, group: JSON.parse(JSON.stringify(group)) }
  } catch (error) {
    console.error("Error creating permission group:", error)
    return { error: "Failed to create permission group" }
  }
}

export async function updatePermissionGroup(id, { name, color, permissions }) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" }

  try {
    const group = await prisma.permissionGroup.update({
      where: { id },
      data: {
        name,
        color,
        permissions
      }
    })
    revalidatePath("/admin/roles")
    return { success: true, group: JSON.parse(JSON.stringify(group)) }
  } catch (error) {
    console.error("Error updating permission group:", error)
    return { error: "Failed to update permission group" }
  }
}

export async function deletePermissionGroup(id) {
  if (!(await verifyAdmin())) return { error: "Unauthorized" }

  try {
    await prisma.permissionGroup.delete({
      where: { id }
    })
    revalidatePath("/admin/roles")
    return { success: true }
  } catch (error) {
    console.error("Error deleting permission group:", error)
    return { error: "Failed to delete permission group" }
  }
}
