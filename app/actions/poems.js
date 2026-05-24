"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export async function createPoem(formData) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const title = formData.get("title")?.toString().trim()
  const excerpt = formData.get("excerpt")?.toString().trim()
  const fullText = formData.get("fullText")?.toString().trim()
  const tags = formData.get("tags")?.toString().trim() || ""

  if (!title || !fullText) {
    return { error: "Title and body are required." }
  }

  const generatedExcerpt = excerpt || fullText.split("\n").slice(0, 2).join("\n")

  const poem = await prisma.poem.create({
    data: {
      title,
      excerpt: generatedExcerpt,
      fullText,
      tags,
      authorId: session.user.id
    }
  })

  redirect(`/poem/${poem.id}`)
}
