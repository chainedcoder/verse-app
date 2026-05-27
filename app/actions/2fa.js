"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import crypto from "crypto"

export async function setupTOTP() {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  // Generate a secret for the user
  const secret = speakeasy.generateSecret({ name: `Verse (${session.user.email})` })
  const otpauth = secret.otpauth_url

  try {
    // Generate QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth)

    // Save the secret temporarily or directly to the user (unverified state)
    // We'll save it to the user but mfaEnabled is still false
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret.base32 }
    })

    return { success: true, qrCodeDataUrl, secret: secret.base32 }
  } catch (err) {
    console.error("Setup TOTP Error:", err)
    return { success: false, error: "Failed to generate setup details" }
  }
}

export async function verifyTOTP(token) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorSecret: true }
  })

  if (!user || !user.twoFactorSecret) {
    return { success: false, error: "TOTP not configured" }
  }

  const isValid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
    window: 1
  })

  if (isValid) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        mfaEnabled: true,
        twoFactorMethod: "TOTP" 
      }
    })
    return { success: true }
  }

  return { success: false, error: "Invalid code" }
}

export async function disable2FA(token) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  // To disable, verify token first if TOTP is used
  if (user.twoFactorMethod === "TOTP") {
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    })
    if (!isValid) return { success: false, error: "Invalid code" }
  }

  // TODO: Add verification for Passkeys later

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaEnabled: false,
      twoFactorMethod: null,
      twoFactorSecret: null
    }
  })

  return { success: true }
}

export async function setupEmailOTP() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      mfaEnabled: true,
      twoFactorMethod: "EMAIL"
    }
  })

  return { success: true }
}

export async function sendEmailOTP(email) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.mfaEnabled || user.twoFactorMethod !== "EMAIL") {
    return { success: false, error: "Email 2FA not enabled for this user." }
  }

  // Generate a random 6 digit code
  const code = crypto.randomInt(100000, 999999).toString()
  
  // Set expiration (e.g. 10 minutes)
  const expires = new Date(Date.now() + 10 * 60 * 1000)

  // In a real app, delete old tokens for this email first
  await prisma.verificationToken.deleteMany({ where: { identifier: email } })

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: code,
      expires
    }
  })

  // Mock Email Sending
  console.log(`\n\n==============================================`)
  console.log(`📩 EMAIL INTERCEPTED`)
  console.log(`To: ${email}`)
  console.log(`Subject: Your Verse App 2FA Login Code`)
  console.log(`Code: ${code}`)
  console.log(`==============================================\n\n`)

  return { success: true }
}

