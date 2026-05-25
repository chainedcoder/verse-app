"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function requestPasswordReset(email) {
  if (!email) {
    return { success: false, error: "Email is required" }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return { success: true }
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour from now

    // Clear any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email }
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires
      }
    })

    // Log the reset link for local development
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${token}`
    console.log("===========================================")
    console.log("PASSWORD RESET REQUESTED")
    console.log(`To: ${email}`)
    console.log(`Link: ${resetLink}`)
    console.log("===========================================")

    return { success: true }
  } catch (error) {
    console.error("Error requesting password reset:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    return { success: false, error: "Token and new password are required" }
  }

  if (newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long" }
  }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken) {
      return { success: false, error: "Invalid or expired token" }
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token }
      })
      return { success: false, error: "Token has expired" }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    })

    await prisma.verificationToken.delete({
      where: { token }
    })

    return { success: true }
  } catch (error) {
    console.error("Error resetting password:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
