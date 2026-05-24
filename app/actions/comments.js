"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createComment(poemId, content) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const userId = session.user.id

  // Basic validation
  if (!content || content.trim() === "") {
    return { success: false, error: "Comment cannot be empty" }
  }

  try {
    const poem = await prisma.poem.findUnique({
      where: { id: poemId },
      select: { authorId: true }
    })

    if (!poem) {
      return { success: false, error: "Poem not found" }
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        poemId,
        authorId: userId
      }
    })

    if (poem.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: poem.authorId,
          type: "COMMENT",
          actorId: userId,
          poemId: poemId
        }
      })
    }

    revalidatePath(`/poem/${poemId}`)
    return { success: true, comment }
  } catch (error) {
    console.error("Error creating comment:", error)
    return { success: false, error: "Failed to create comment" }
  }
}

export async function getCommentsForPoem(poemId) {
  try {
    const comments = await prisma.comment.findMany({
      where: { poemId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })
    return { success: true, comments }
  } catch (error) {
    console.error("Error fetching comments:", error)
    return { success: false, error: "Failed to fetch comments" }
  }
}

export async function deleteComment(commentId) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const userId = session.user.id

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, poemId: true }
    })

    if (!comment) {
      return { success: false, error: "Comment not found" }
    }

    if (comment.authorId !== userId) {
      return { success: false, error: "Unauthorized to delete this comment" }
    }

    await prisma.comment.delete({
      where: { id: commentId }
    })

    revalidatePath(`/poem/${comment.poemId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting comment:", error)
    return { success: false, error: "Failed to delete comment" }
  }
}