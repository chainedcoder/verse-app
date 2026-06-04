import { generateToken, verifyToken } from "@/lib/jwt"

describe("JWT Utilities", () => {
  const testPayload = { id: "user-123", email: "test@example.com", name: "Test User" }
  let token

  beforeAll(() => {
    token = generateToken(testPayload)
  })

  it("generates a valid JWT token string", () => {
    expect(token).toBeDefined()
    expect(typeof token).toBe("string")
    // JWT has 3 parts separated by dots
    expect(token.split(".")).toHaveLength(3)
  })

  it("verifies a valid token and returns the payload", () => {
    const result = verifyToken(token)
    expect(result.valid).toBe(true)
    expect(result.payload).toBeDefined()
    expect(result.payload.id).toBe(testPayload.id)
    expect(result.payload.email).toBe(testPayload.email)
    expect(result.payload.name).toBe(testPayload.name)
    expect(result.payload.iat).toBeDefined()
    expect(result.payload.exp).toBeDefined()
  })

  it("rejects a token with invalid signature", () => {
    const parts = token.split(".")
    parts[2] = "invalidsignature"
    const tampered = parts.join(".")
    const result = verifyToken(tampered)
    expect(result.valid).toBe(false)
    expect(result.error).toBe("Invalid signature")
  })

  it("rejects a token with invalid format", () => {
    const result = verifyToken("not-a-jwt")
    expect(result.valid).toBe(false)
    expect(result.error).toBe("Invalid token format")
  })

  it("rejects an empty token", () => {
    const result = verifyToken("")
    expect(result.valid).toBe(false)
  })

  it("includes iat and exp in the payload", () => {
    const result = verifyToken(token)
    expect(result.payload.iat).toBeGreaterThan(0)
    expect(result.payload.exp).toBeGreaterThan(result.payload.iat)
    // Default expiry is 30 days
    const thirtyDays = 60 * 60 * 24 * 30
    expect(result.payload.exp - result.payload.iat).toBe(thirtyDays)
  })
})
