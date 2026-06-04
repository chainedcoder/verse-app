import crypto from "crypto"

const JWT_SECRET = process.env.AUTH_SECRET || "verse-dev-secret-key-change-in-production"
const JWT_EXPIRY_SECONDS = 60 * 60 * 24 * 30 // 30 days

/**
 * Base64url encode a buffer or string.
 */
function base64urlEncode(data) {
  const str = typeof data === "string" ? data : data.toString("base64")
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * Base64url decode to a string.
 */
function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/")
  while (str.length % 4) str += "="
  return Buffer.from(str, "base64").toString("utf-8")
}

/**
 * Create an HMAC-SHA256 signature.
 */
function sign(input) {
  return base64urlEncode(
    crypto.createHmac("sha256", JWT_SECRET).update(input).digest()
  )
}

/**
 * Generate a JWT token for a user.
 * @param {Object} payload - { id, email, name }
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  const header = base64urlEncode(
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  )

  const now = Math.floor(Date.now() / 1000)
  const tokenPayload = base64urlEncode(
    Buffer.from(
      JSON.stringify({
        ...payload,
        iat: now,
        exp: now + JWT_EXPIRY_SECONDS,
      })
    )
  )

  const signature = sign(`${header}.${tokenPayload}`)
  return `${header}.${tokenPayload}.${signature}`
}

/**
 * Verify and decode a JWT token.
 * @param {string} token - JWT token string
 * @returns {{ valid: boolean, payload?: Object, error?: string }}
 */
export function verifyToken(token) {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" }
    }

    const [header, payload, signature] = parts

    // Verify signature
    const expectedSignature = sign(`${header}.${payload}`)
    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid signature" }
    }

    // Decode payload
    const decoded = JSON.parse(base64urlDecode(payload))

    // Check expiry
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp && decoded.exp < now) {
      return { valid: false, error: "Token expired" }
    }

    return { valid: true, payload: decoded }
  } catch (error) {
    return { valid: false, error: "Token verification failed" }
  }
}
