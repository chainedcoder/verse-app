import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

import speakeasy from "speakeasy"

const getDbSession = async (sessionId) => {
  return await prisma.session.findUnique({
    where: { sessionToken: sessionId }
  })
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totp: { label: "2FA Code", type: "text" },
        passkeyResponse: { label: "Passkey Response", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { authenticators: true }
        })

        if (!user) {
          return null
        }

        // --- PASSKEY LOGIN FLOW ---
        if (credentials.passkeyResponse) {
          const { verifyAuthenticationResponse } = await import('@simplewebauthn/server')
          
          if (!user.currentChallenge) {
            throw new Error("NO_CHALLENGE")
          }
          
          let authResp;
          try {
             authResp = JSON.parse(credentials.passkeyResponse)
          } catch(e) {
             throw new Error("INVALID_PASSKEY_PAYLOAD")
          }

          const authenticator = user.authenticators.find(a => a.credentialID === authResp.id)
          if (!authenticator) {
            throw new Error("AUTHENTICATOR_NOT_FOUND")
          }

          let verification;
          try {
            verification = await verifyAuthenticationResponse({
              response: authResp,
              expectedChallenge: user.currentChallenge,
              expectedOrigin: "http://localhost:3000",
              expectedRPID: "localhost",
              authenticator: {
                credentialID: authenticator.credentialID,
                credentialPublicKey: Buffer.from(authenticator.credentialPublicKey, 'base64url'),
                counter: authenticator.counter,
                transports: authenticator.transports ? authenticator.transports.split(',') : []
              }
            })
          } catch (error) {
            console.error("Passkey verification error:", error)
            throw new Error("PASSKEY_VERIFICATION_FAILED")
          }

          if (verification.verified) {
            // Update the authenticator counter
            await prisma.authenticator.update({
              where: { userId_credentialID: { userId: user.id, credentialID: authenticator.credentialID } },
              data: { counter: verification.authenticationInfo.newCounter }
            })
            // Clear the challenge
            await prisma.user.update({
              where: { id: user.id },
              data: { currentChallenge: null }
            })
            return user
          }
          throw new Error("PASSKEY_VERIFICATION_FAILED")
        }

        // --- PASSWORD LOGIN FLOW ---
        if (!credentials.password || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // 2FA Verification
        if (user.mfaEnabled) {
          if (user.twoFactorMethod === "TOTP") {
            if (!credentials.totp) {
              throw new Error("2FA_REQUIRED_TOTP")
            }
            const isValid = speakeasy.totp.verify({
              secret: user.twoFactorSecret,
              encoding: 'base32',
              token: credentials.totp,
              window: 1 // allow 1 step before/after for slight time drift
            })
            if (!isValid) {
              throw new Error("INVALID_2FA")
            }
          } else if (user.twoFactorMethod === "EMAIL") {
            if (!credentials.totp) {
              // We just use 'totp' field for both TOTP and EMAIL codes to simplify the UI
              throw new Error("2FA_REQUIRED_EMAIL")
            }
            
            // Verify Email OTP token in DB
            const verificationToken = await prisma.verificationToken.findFirst({
              where: {
                identifier: user.email,
                token: credentials.totp,
              }
            })

            if (!verificationToken) {
              throw new Error("INVALID_2FA")
            }

            if (verificationToken.expires < new Date()) {
              throw new Error("INVALID_2FA") // Expired
            }

            // Valid code, delete it so it can't be reused
            await prisma.verificationToken.delete({
              where: {
                identifier_token: {
                  identifier: user.email,
                  token: credentials.totp
                }
              }
            })
          }
        }

        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        // Create a DB session manually for tracking and revoking
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        const sessionToken = crypto.randomUUID()
        token.sessionId = sessionToken
        await prisma.session.create({
          data: {
            sessionToken,
            userId: user.id,
            expires
          }
        })
      }
      
      // Verify the session hasn't been revoked
      if (token.sessionId) {
        try {
          const dbSession = await getDbSession(token.sessionId)
          if (!dbSession) return null // Force logout if session deleted
        } catch (error) {
          console.error("Error fetching db session:", error)
          // If the DB query fails, we probably shouldn't log them out immediately,
          // but for strict security you could return null here.
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (!token) return null
      if (token?.sub) {
        session.user.id = token.sub
      }
      // Pass the session token to the client so it knows its current session
      if (token?.sessionId) {
        session.sessionToken = token.sessionId
      }
      return session
    }
  }
})
