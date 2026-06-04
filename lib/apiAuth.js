import { verifyToken } from "./jwt"
import { prisma } from "./prisma"

/**
 * Extract and verify the JWT bearer token from request headers.
 * Returns the authenticated user or null.
 *
 * @param {Request} request - The incoming request
 * @returns {Promise<{ user: Object|null, error: string|null }>}
 */
export async function authenticateRequest(request) {
  const authHeader = request.headers.get("authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid authorization header" }
  }

  const token = authHeader.slice(7)
  const result = verifyToken(token)

  if (!result.valid) {
    return { user: null, error: result.error }
  }

  // Verify user still exists and is active
  try {
    const user = await prisma.user.findUnique({
      where: { id: result.payload.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        bio: true,
        location: true,
        website: true,
        theme: true,
        role: true,
        status: true,
        immersiveMode: true,
        isPrivateAccount: true,
        createdAt: true,
      },
    })

    if (!user) {
      return { user: null, error: "User not found" }
    }

    if (user.status !== "ACTIVE") {
      return { user: null, error: "Account is suspended or banned" }
    }

    return { user, error: null }
  } catch (error) {
    console.error("API auth error:", error)
    return { user: null, error: "Authentication failed" }
  }
}

/**
 * Helper that returns a 401 JSON response.
 */
export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json({ error: message }, { status: 401 })
}

/**
 * Require authentication. Returns user or throws a Response.
 * Usage: const user = await requireAuth(request)
 */
export async function requireAuth(request) {
  const { user, error } = await authenticateRequest(request)
  if (!user) {
    throw unauthorizedResponse(error)
  }
  return user
}
