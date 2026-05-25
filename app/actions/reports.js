"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function submitReport({ type, targetId, reason }) {
  const session = await auth()
  
  if (!session?.user) {
    return { success: false, error: "You must be logged in to report content" }
  }

  // Ensure the user hasn't been banned
  const user = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (user?.status === "BANNED") {
    return { success: false, error: "Your account has been banned" }
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: "Please provide a valid reason (at least 5 characters)" }
  }

  try {
    const data = {
      reporterId: session.user.id,
      reason: reason.trim(),
    }

    if (type === "POEM") {
      data.reportedPoemId = targetId
    } else if (type === "USER") {
      data.reportedUserId = targetId
    } else if (type === "COMMENT") {
      data.reportedCommentId = targetId
    } else {
      return { success: false, error: "Invalid report type" }
    }

    await prisma.report.create({ data })

    return { success: true }
  } catch (error) {
    console.error("Error submitting report:", error)
    return { success: false, error: "Failed to submit report. Please try again." }
  }
}
