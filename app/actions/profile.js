"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { uploadFileToS3 } from "@/lib/s3"

export async function updateProfile(formData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in to update your profile" }
  }

  const name = formData.get("name")
  const username = formData.get("username")
  const website = formData.get("website")
  const bio = formData.get("bio")
  const location = formData.get("location")
  const avatarFile = formData.get("avatar")

  let imagePath = undefined

  if (avatarFile && avatarFile.size > 0) {
    try {
      const bytes = await avatarFile.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const ext = avatarFile.name.split('.').pop()
      const filename = `${session.user.id}-${Date.now()}.${ext}`

      // Upload to S3
      imagePath = await uploadFileToS3(buffer, filename, avatarFile.type)
    } catch (e) {
      console.error("Error saving avatar:", e)
      return { error: "Failed to upload avatar image" }
    }
  }

  try {
    const dataToUpdate = {
      name: name || null,
      username: username || null,
      website: website || null,
      bio: bio || null,
      location: location || null,
    }
    
    if (imagePath) {
      dataToUpdate.image = imagePath
    }

    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUser && existingUser.id !== session.user.id) {
        return { error: "Username is already taken" }
      }
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

export async function updateAccountSettings(formData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in to update account settings" }
  }

  const isPrivateAccount = formData.get("isPrivateAccount") === "true"
  const mfaEnabled = formData.get("mfaEnabled") === "true"
  const emailNotifications = formData.get("emailNotifications") === "true"

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isPrivateAccount,
        mfaEnabled,
        emailNotifications,
      }
    })

    revalidatePath("/settings/account")
    return { success: true }
  } catch (error) {
    console.error("Error updating account settings:", error)
    return { error: "Failed to update account settings" }
  }
}

export async function updatePreferences(formData) {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in to update preferences" }
  }

  const theme = formData.get("theme")
  const immersiveMode = formData.get("immersiveMode") === "true"
  let exportPreferences = undefined
  try {
    const watermark = formData.get("exportWatermark")
    const margin = parseInt(formData.get("exportMargin"), 10) || 20
    if (watermark) {
      exportPreferences = { watermark, margin }
    }
  } catch (e) {
    console.error("Failed to parse export preferences", e)
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        theme,
        immersiveMode,
        ...(exportPreferences !== undefined && { exportPreferences })
      }
    })

    revalidatePath("/settings/preferences")
    return { success: true }
  } catch (error) {
    console.error("Error updating preferences:", error)
    return { error: "Failed to update preferences" }
  }
}

export async function deleteAccount() {
  const session = await auth()
  if (!session?.user) {
    return { error: "You must be logged in to delete your account" }
  }

  const userId = session.user.id

  try {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: {
          status: "DELETED",
          name: "[deleted]",
          username: `deleted-${userId}`,
          email: `deleted-${userId}@deleted.local`,
          bio: null,
          website: null,
          location: null,
          image: null,
          password: null,
          twoFactorSecret: null,
        }
      }),
      prisma.account.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.authenticator.deleteMany({ where: { userId } }),
      prisma.poem.deleteMany({ where: { authorId: userId } }),
      prisma.like.deleteMany({ where: { userId } }),
      prisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
      prisma.collection.deleteMany({ where: { authorId: userId } }),
      prisma.notification.deleteMany({ where: { OR: [{ userId }, { actorId: userId }] } })
    ])
    
    return { success: true }
  } catch (error) {
    console.error("Error soft deleting account:", error)
    return { error: "Failed to delete account" }
  }
}
