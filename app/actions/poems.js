"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createPoem(formData) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const title = formData.get("title")?.toString().trim()
  const excerpt = formData.get("excerpt")?.toString().trim()
  const fullText = formData.get("fullText")?.toString().trim()
  const tagsString = formData.get("tags")?.toString().trim() || ""
  const status = formData.get("status")?.toString() === "DRAFT" ? "DRAFT" : "PUBLISHED"
  const isPrivate = formData.get("isPrivate") === "true"

  if (!title || !fullText) {
    return { error: "Title and body are required." }
  }

  const generatedExcerpt = excerpt || fullText.split("\n").slice(0, 2).join("\n")
  const tagsArray = tagsString.split(',').map(t => t.trim()).filter(Boolean)

  const poem = await prisma.poem.create({
    data: {
      title,
      excerpt: generatedExcerpt,
      fullText,
      status,
      isPrivate,
      tags: {
        connectOrCreate: tagsArray.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      },
      authorId: session.user.id
    }
  })

  redirect(`/poem/${poem.id}`)
}

export async function updatePoem(poemId, formData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const poem = await prisma.poem.findUnique({ where: { id: poemId } })
  if (!poem || poem.authorId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  const title = formData.get("title")?.toString().trim()
  const excerpt = formData.get("excerpt")?.toString().trim()
  const fullText = formData.get("fullText")?.toString().trim()
  const tagsString = formData.get("tags")?.toString().trim() || ""
  const status = formData.get("status")?.toString() === "DRAFT" ? "DRAFT" : "PUBLISHED"
  const isPrivate = formData.get("isPrivate") === "true"

  if (!title || !fullText) {
    return { error: "Title and body are required." }
  }

  const generatedExcerpt = excerpt || fullText.split("\n").slice(0, 2).join("\n")
  const tagsArray = tagsString.split(',').map(t => t.trim()).filter(Boolean)

  await prisma.poem.update({
    where: { id: poemId },
    data: {
      title,
      excerpt: generatedExcerpt,
      fullText,
      status,
      isPrivate,
      tags: {
        set: [], // clear existing tags
        connectOrCreate: tagsArray.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      }
    }
  })

  revalidatePath(`/poem/${poemId}`)
  revalidatePath('/')
  redirect(`/poem/${poemId}`)
}

export async function toggleFeatured(poemId) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const poem = await prisma.poem.findUnique({ where: { id: poemId } })
  if (!poem || poem.authorId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  await prisma.poem.update({
    where: { id: poemId },
    data: { featured: !poem.featured }
  })
  
  revalidatePath(`/poem/${poemId}`)
  revalidatePath('/')
  return { success: true }
}

export async function deletePoem(poemId) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const poem = await prisma.poem.findUnique({ where: { id: poemId } })
  if (!poem || poem.authorId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  await prisma.poem.update({
    where: { id: poemId },
    data: { status: "DELETED" }
  })
  
  revalidatePath('/')
  return { success: true }
}

export async function restorePoem(poemId) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const poem = await prisma.poem.findUnique({ where: { id: poemId } })
  if (!poem || poem.authorId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  await prisma.poem.update({
    where: { id: poemId },
    data: { status: "DRAFT" }
  })
  
  revalidatePath('/')
  return { success: true }
}

export async function searchPoems(query) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const q = query.trim()
  if (!q) return { poems: [] }

  const poems = await prisma.poem.findMany({
    where: {
      status: "PUBLISHED",
      isPrivate: false,
      OR: [
        { title: { contains: q } },
        { author: { name: { contains: q } } }
      ]
    },
    select: { id: true, title: true, status: true, author: { select: { name: true } } },
    take: 10
  })

  return { poems }
}
