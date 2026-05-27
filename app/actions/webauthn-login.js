"use server"

import { prisma } from "@/lib/prisma"
import { generateAuthenticationOptions } from "@simplewebauthn/server"

const rpID = "localhost"

export async function getAuthenticationOptions(email) {
  if (!email) {
    return { success: false, error: "Email is required for passkey login." }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { authenticators: true }
  })

  if (!user || user.authenticators.length === 0) {
    return { success: false, error: "No passkeys found for this account." }
  }

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials: user.authenticators.map(auth => ({
      id: auth.credentialID,
      type: 'public-key',
      transports: auth.transports ? auth.transports.split(',') : []
    })),
    userVerification: "preferred"
  })

  // Store the challenge for verification
  await prisma.user.update({
    where: { id: user.id },
    data: { currentChallenge: options.challenge }
  })

  return { success: true, options }
}
