"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function toggleLike(poemId) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const userId = session.user.id

  const existingLike = await prisma.like.findUnique({
    where: {
      poemId_userId: {
        poemId,
        userId
      }
    }
  })

  let isLiked = false

  if (existingLike) {
    await prisma.like.delete({
      where: {
        id: existingLike.id
      }
    })
  } else {
    await prisma.like.create({
      data: {
        poemId,
        userId
      }
    })
    isLiked = true
  }

  revalidatePath("/")
  revalidatePath(`/poem/${poemId}`)
  // Potentially revalidate author page as well
  
  return { success: true, isLiked }
}

export async function toggleFollow(authorId) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const followerId = session.user.id

  if (followerId === authorId) {
    return { success: false, error: "Cannot follow yourself" }
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: authorId
      }
    }
  })

  let isFollowing = false

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        id: existingFollow.id
      }
    })
  } else {
    await prisma.follow.create({
      data: {
        followerId,
        followingId: authorId
      }
    })
    isFollowing = true
  }

  revalidatePath("/")
  revalidatePath(`/author/${authorId}`)
  
  return { success: true, isFollowing }
}
