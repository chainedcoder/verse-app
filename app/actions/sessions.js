"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function revokeSession(sessionId) {
  const session = await auth()
  
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  // Ensure user owns the session
  const targetSession = await prisma.session.findUnique({
    where: { id: sessionId }
  })

  if (!targetSession || targetSession.userId !== session.user.id) {
    return { error: "Session not found or unauthorized" }
  }

  try {
    await prisma.session.delete({
      where: { id: sessionId }
    })
    return { success: true }
  } catch (error) {
    console.error("Error revoking session:", error)
    return { error: "Failed to revoke session" }
  }
}
