"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function createCollection(formData) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const name = formData.get("name")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const isPublic = formData.get("isPublic") === "true"

  if (!name) {
    return { error: "Collection name is required." }
  }

  const collection = await prisma.collection.create({
    data: {
      name,
      description,
      isPublic,
      authorId: session.user.id
    }
  })

  revalidatePath("/collections")
  redirect(`/collections/${collection.id}`)
}

export async function updateCollection(collectionId, formData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const name = formData.get("name")?.toString().trim()
  const description = formData.get("description")?.toString().trim()
  const isPublic = formData.get("isPublic") === "true"

  if (!name) {
    return { error: "Collection name is required." }
  }

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } })
  if (!collection || collection.authorId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  await prisma.collection.update({
    where: { id: collectionId },
    data: { name, description, isPublic }
  })

  revalidatePath(`/collections/${collectionId}`)
  revalidatePath("/collections")
  return { success: true }
}

export async function togglePoemInCollection(collectionId, poemId) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  // Check if collection belongs to user
  const collection = await prisma.collection.findUnique({
    where: { id: collectionId },
    include: { poems: { select: { id: true } } }
  })

  if (!collection || collection.authorId !== session.user.id) {
    throw new Error("Collection not found or unauthorized")
  }

  const hasPoem = collection.poems.some(p => p.id === poemId)

  if (hasPoem) {
    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        poems: {
          disconnect: { id: poemId }
        }
      }
    })
  } else {
    await prisma.collection.update({
      where: { id: collectionId },
      data: {
        poems: {
          connect: { id: poemId }
        }
      }
    })
  }

  revalidatePath(`/collections/${collectionId}`)
  revalidatePath(`/poem/${poemId}`)
}

export async function deleteCollection(collectionId) {
  const session = await auth()
  if (!session?.user) {
    throw new Error("Unauthorized")
  }

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } })
  if (!collection || collection.authorId !== session.user.id) {
    throw new Error("Unauthorized")
  }

  await prisma.collection.update({
    where: { id: collectionId },
    data: { status: "DELETED" }
  })
  
  revalidatePath("/collections")
  return { success: true }
}

export async function restoreCollection(collectionId) {
  const session = await auth()
  if (!session?.user) {
    return { error: "Unauthorized" }
  }

  const collection = await prisma.collection.findUnique({ where: { id: collectionId } })
  if (!collection || collection.authorId !== session.user.id) {
    return { error: "Unauthorized" }
  }

  await prisma.collection.update({
    where: { id: collectionId },
    data: { status: "ACTIVE" }
  })
  
  revalidatePath("/collections")
  return { success: true }
}
