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
