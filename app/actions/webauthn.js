"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server"

// You'd typically use your actual domain, hardcoded here for localhost testing
const rpName = "Verse App"
const rpID = "localhost"
const origin = "http://localhost:3000"

export async function getRegistrationOptions() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { authenticators: true }
  })

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: user.id,
    userName: user.email,
    attestationType: "none",
    excludeCredentials: user.authenticators.map(auth => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports ? auth.transports.split(',') : []
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    }
  })

  // Store the challenge in the DB temporarily
  await prisma.user.update({
    where: { id: user.id },
    data: { currentChallenge: options.challenge }
  })

  return { success: true, options }
}

export async function verifyRegistration(registrationResponse) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user.currentChallenge) {
    return { success: false, error: "No active registration challenge" }
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge: user.currentChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    })
  } catch (error) {
    console.error("Verification failed:", error)
    return { success: false, error: error.message }
  }

  const { verified, registrationInfo } = verification
  if (verified && registrationInfo) {
    const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = registrationInfo

    // Save the authenticator
    await prisma.authenticator.create({
      data: {
        credentialID: Buffer.from(credentialID).toString("base64url"),
        credentialPublicKey: Buffer.from(credentialPublicKey).toString("base64url"),
        counter,
        credentialDeviceType,
        credentialBackedUp,
        userId: user.id,
        providerAccountId: "webauthn", // mock for next-auth provider compatibility if needed
        transports: registrationResponse.response.transports ? registrationResponse.response.transports.join(',') : ""
      }
    })

    // Enable MFA with PASSKEY method
    await prisma.user.update({
      where: { id: user.id },
      data: {
        mfaEnabled: true,
        twoFactorMethod: "PASSKEY",
        currentChallenge: null // Clear challenge
      }
    })

    return { success: true }
  }

  return { success: false, error: "Verification failed" }
}
