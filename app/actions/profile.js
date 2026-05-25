"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function updateProfile(formData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in to update your profile" }
  }

  const name = formData.get("name")
  const bio = formData.get("bio")
  const location = formData.get("location")
  const avatarFile = formData.get("avatar")

  let imagePath = undefined

  if (avatarFile && avatarFile.size > 0) {
    try {
      const bytes = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Ensure directory exists
      const uploadDir = path.join(process.cwd(), "public/uploads/avatars")
      await mkdir(uploadDir, { recursive: true })

      // Generate unique filename
      const ext = avatarFile.name.split('.').pop()
      const filename = `${session.user.id}-${Date.now()}.${ext}`
      const filepath = path.join(uploadDir, filename)

      // Save file
      await writeFile(filepath, buffer)
      imagePath = `/uploads/avatars/${filename}`
    } catch (e) {
      console.error("Error saving avatar:", e)
      return { error: "Failed to upload avatar image" }
    }
  }

  try {
    const dataToUpdate = {
      name: name || null,
      bio: bio || null,
      location: location || null,
    }
    
    if (imagePath) {
      dataToUpdate.image = imagePath
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: dataToUpdate
    })

    revalidatePath("/settings/profile")
    revalidatePath(`/author/${session.user.id}`)
    
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile details" }
  }
}
