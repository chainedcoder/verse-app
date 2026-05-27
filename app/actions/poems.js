"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { uploadFileToS3 } from "@/lib/s3"

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
  let vibeConfig = []
  try {
    vibeConfig = JSON.parse(formData.get("vibeConfig")?.toString() || "[]")
  } catch (e) {
    vibeConfig = []
  }

  if (!title || !fullText) {
    return { error: "Title and body are required." }
  }

  const generatedExcerpt = excerpt || fullText.split("\n").slice(0, 2).join("\n")
  const tagsArray = tagsString.split(',').map(t => t.trim()).filter(Boolean)

  const imageFiles = formData.getAll("images").filter(f => f && f.size > 0)
  const uploadedImages = []
  
  for (const file of imageFiles) {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = file.name.split('.').pop()
      const filename = `poem-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const url = await uploadFileToS3(buffer, filename, file.type)
      uploadedImages.push({ url, alt: file.name })
    } catch (e) {
      console.error("Error uploading poem image:", e)
    }
  }

  const poem = await prisma.poem.create({
    data: {
      title,
      excerpt: generatedExcerpt,
      fullText,
      status,
      isPrivate,
      vibeConfig,
      tags: {
        connectOrCreate: tagsArray.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      },
      images: {
        create: uploadedImages
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
  let vibeConfig = []
  try {
    vibeConfig = JSON.parse(formData.get("vibeConfig")?.toString() || "[]")
  } catch (e) {
    vibeConfig = []
  }

  if (!title || !fullText) {
    return { error: "Title and body are required." }
  }

  const generatedExcerpt = excerpt || fullText.split("\n").slice(0, 2).join("\n")
  const tagsArray = tagsString.split(',').map(t => t.trim()).filter(Boolean)

  const imageFiles = formData.getAll("images").filter(f => f && f.size > 0)
  const uploadedImages = []
  
  for (const file of imageFiles) {
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const ext = file.name.split('.').pop()
      const filename = `poem-${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const url = await uploadFileToS3(buffer, filename, file.type)
      uploadedImages.push({ url, alt: file.name })
    } catch (e) {
      console.error("Error uploading poem image:", e)
    }
  }

  const updateData = {
    title,
    excerpt: generatedExcerpt,
    fullText,
    status,
    isPrivate,
    vibeConfig,
    tags: {
      set: [], // clear existing tags
      connectOrCreate: tagsArray.map(tag => ({
        where: { name: tag },
        create: { name: tag }
      }))
    }
  }

  if (uploadedImages.length > 0) {
    updateData.images = {
      create: uploadedImages
    }
  }

  await prisma.poem.update({
    where: { id: poemId },
    data: updateData
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
    select: { id: true, title: true, status: true, images: true, author: { select: { name: true } } },
    take: 10
  })

  return { poems }
}

export async function getPaginatedPoems({ cursor, limit = 6, activeTag = "all" } = {}) {
  const session = await auth()
  const userId = session?.user?.id

  const where = {
    status: { not: "DELETED" },
    featured: false,
    ...(userId
      ? {
          OR: [
            { isPrivate: false },
            { authorId: userId }
          ]
        }
      : { isPrivate: false })
  }

  if (activeTag === "following") {
    if (!userId) {
      return { poems: [], nextCursor: null }
    }
    where.author = {
      followers: {
        some: {
          followerId: userId
        }
      }
    }
  } else if (activeTag !== "all") {
    where.tags = {
      some: {
        name: activeTag
      }
    }
  }

  const queryOptions = {
    where,
    take: limit + 1,
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      author: true,
      tags: true,
      images: true,
      _count: {
        select: { likes: true }
      }
    }
  }

  if (cursor) {
    queryOptions.cursor = { id: cursor }
    queryOptions.skip = 1
  }

  const poems = await prisma.poem.findMany(queryOptions)

  let nextCursor = null
  if (poems.length > limit) {
    const nextItem = poems.pop()
    nextCursor = nextItem.id
  }

  return {
    poems: JSON.parse(JSON.stringify(poems)),
    nextCursor
  }
}

