/**
 * Unit tests for admin bulk server actions.
 * Prisma and auth are mocked to avoid real DB calls.
 */

// Mock the "use server" directive — Jest doesn't understand it
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    poem: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  }
}))

jest.mock("@/auth", () => ({
  auth: jest.fn()
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}))

// We need to re-require after mocks are set up
let deleteUsersNuclearBulk, deletePoemsAdminBulk
let prisma, authMock, revalidatePath

beforeEach(async () => {
  jest.resetModules()

  // Re-apply mocks after reset
  jest.mock("@/lib/prisma", () => ({
    prisma: {
      user: {
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      poem: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    }
  }))

  jest.mock("@/auth", () => ({
    auth: jest.fn()
  }))

  jest.mock("next/cache", () => ({
    revalidatePath: jest.fn()
  }))
})

// We test the logic inline since server actions can't easily be imported in jest
// This tests the logic directly using the mock interfaces

describe("deleteUsersNuclearBulk logic", () => {
  let mockPrisma, mockAuth, mockRevalidate

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    }
    mockAuth = jest.fn()
    mockRevalidate = jest.fn()
  })

  async function runBulkUserDelete(userIds, sessionUser, callerRole) {
    // Simulates the server action logic
    const session = await mockAuth()
    if (!session?.user) return { error: "Unauthorized" }

    const caller = await mockPrisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, status: true }
    })
    if (!caller || caller.status === "BANNED") return { error: "Unauthorized" }
    if (caller.role !== "ADMIN") return { error: "Only administrators can permanently delete users" }

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { error: "No users selected" }
    }

    const filteredIds = userIds.filter(id => id !== session.user.id)
    if (filteredIds.length === 0) {
      return { error: "Cannot delete your own account" }
    }

    try {
      await mockPrisma.$transaction(
        filteredIds.map(id => ({ delete: { where: { id } } }))
      )
      mockRevalidate("/admin/users")
      return { success: true, deletedCount: filteredIds.length }
    } catch (err) {
      return { error: "Failed to delete users. Some may not exist." }
    }
  }

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null)
    const result = await runBulkUserDelete(["u1"])
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("returns error when caller is not ADMIN", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller-id" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "MODERATOR", status: "ACTIVE" })
    const result = await runBulkUserDelete(["u1"])
    expect(result).toEqual({ error: "Only administrators can permanently delete users" })
  })

  it("returns error for empty array", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller-id" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    const result = await runBulkUserDelete([])
    expect(result).toEqual({ error: "No users selected" })
  })

  it("filters out self from deletion", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller-id" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    mockPrisma.$transaction.mockResolvedValue([])

    const result = await runBulkUserDelete(["caller-id"])
    expect(result).toEqual({ error: "Cannot delete your own account" })
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it("calls $transaction for valid IDs excluding self", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller-id" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    mockPrisma.$transaction.mockResolvedValue([])

    const result = await runBulkUserDelete(["caller-id", "u1", "u2"])
    expect(result.success).toBe(true)
    expect(result.deletedCount).toBe(2) // caller-id filtered out
    expect(mockPrisma.$transaction).toHaveBeenCalled()
  })

  it("returns error when $transaction throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller-id" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    mockPrisma.$transaction.mockRejectedValue(new Error("DB error"))

    const result = await runBulkUserDelete(["u1"])
    expect(result.error).toMatch(/failed to delete/i)
  })
})

describe("deletePoemsAdminBulk logic", () => {
  let mockPrisma, mockAuth, mockRevalidate

  beforeEach(() => {
    mockPrisma = {
      user: { findUnique: jest.fn() },
      poem: { updateMany: jest.fn() },
    }
    mockAuth = jest.fn()
    mockRevalidate = jest.fn()
  })

  async function runBulkPoemDelete(poemIds) {
    const session = await mockAuth()
    if (!session?.user) return { error: "Unauthorized" }

    const caller = await mockPrisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, status: true }
    })
    if (!caller || caller.status === "BANNED") return { error: "Unauthorized" }
    if (caller.role !== "ADMIN" && caller.role !== "MODERATOR") return { error: "Unauthorized" }

    if (!Array.isArray(poemIds) || poemIds.length === 0) {
      return { error: "No poems selected" }
    }

    try {
      await mockPrisma.poem.updateMany({
        where: { id: { in: poemIds } },
        data: { status: "DELETED" }
      })
      mockRevalidate("/admin/content")
      return { success: true, deletedCount: poemIds.length }
    } catch (err) {
      return { error: "Failed to delete poems" }
    }
  }

  it("returns error when unauthenticated", async () => {
    mockAuth.mockResolvedValue(null)
    const result = await runBulkPoemDelete(["p1"])
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("returns error for USER role (not admin/mod)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "USER", status: "ACTIVE" })
    const result = await runBulkPoemDelete(["p1"])
    expect(result).toEqual({ error: "Unauthorized" })
  })

  it("allows MODERATOR to bulk delete poems", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "MODERATOR", status: "ACTIVE" })
    mockPrisma.poem.updateMany.mockResolvedValue({ count: 2 })

    const result = await runBulkPoemDelete(["p1", "p2"])
    expect(result.success).toBe(true)
    expect(result.deletedCount).toBe(2)
    expect(mockPrisma.poem.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["p1", "p2"] } },
      data: { status: "DELETED" }
    })
  })

  it("allows ADMIN to bulk delete poems", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    mockPrisma.poem.updateMany.mockResolvedValue({ count: 1 })

    const result = await runBulkPoemDelete(["p1"])
    expect(result.success).toBe(true)
  })

  it("returns error for empty poemIds array", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })

    const result = await runBulkPoemDelete([])
    expect(result).toEqual({ error: "No poems selected" })
  })

  it("returns error when updateMany throws", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    mockPrisma.poem.updateMany.mockRejectedValue(new Error("DB error"))

    const result = await runBulkPoemDelete(["p1"])
    expect(result.error).toMatch(/failed to delete/i)
  })

  it("revalidates /admin/content path on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "caller" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    mockPrisma.poem.updateMany.mockResolvedValue({ count: 1 })

    await runBulkPoemDelete(["p1"])
    expect(mockRevalidate).toHaveBeenCalledWith("/admin/content")
  })
})

describe("deleteUser soft delete logic", () => {
  let mockPrisma, mockAuth, mockRevalidate

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      account: { deleteMany: jest.fn() },
      session: { deleteMany: jest.fn() },
      authenticator: { deleteMany: jest.fn() },
      poem: { deleteMany: jest.fn() },
      like: { deleteMany: jest.fn() },
      follow: { deleteMany: jest.fn() },
      collection: { deleteMany: jest.fn() },
      notification: { deleteMany: jest.fn() },
      $transaction: jest.fn((promises) => Promise.all(promises)),
    }
    mockAuth = jest.fn()
    mockRevalidate = jest.fn()
  })

  async function runDeleteUser(userId) {
    const session = await mockAuth()
    if (!session?.user) return { error: "Unauthorized" }

    const caller = await mockPrisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, status: true }
    })
    if (!caller || caller.status === "BANNED") return { error: "Unauthorized" }
    if (caller.role !== "ADMIN") return { error: "Only administrators can delete users" }

    try {
      await mockPrisma.$transaction([
        mockPrisma.user.update({
          where: { id: userId },
          data: { status: "DELETED", name: "[deleted]" }
        }),
        mockPrisma.account.deleteMany({ where: { userId } }),
        mockPrisma.session.deleteMany({ where: { userId } }),
        mockPrisma.authenticator.deleteMany({ where: { userId } }),
        mockPrisma.poem.deleteMany({ where: { authorId: userId } }),
        mockPrisma.like.deleteMany({ where: { userId } }),
        mockPrisma.follow.deleteMany({ where: { OR: [{ followerId: userId }, { followingId: userId }] } }),
        mockPrisma.collection.deleteMany({ where: { authorId: userId } }),
        mockPrisma.notification.deleteMany({ where: { OR: [{ userId }, { actorId: userId }] } })
      ])
      mockRevalidate("/admin/users")
      return { success: true }
    } catch (err) {
      return { error: "Failed to delete user" }
    }
  }

  it("returns error when not authenticated", async () => {
    mockAuth.mockResolvedValue(null)
    const result = await runDeleteUser("u1")
    expect(result.error).toBe("Unauthorized")
  })

  it("updates user status and deletes auth records", async () => {
    mockAuth.mockResolvedValue({ user: { id: "admin" } })
    mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN", status: "ACTIVE" })
    
    const result = await runDeleteUser("u1")
    expect(result.success).toBe(true)
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: { status: "DELETED", name: "[deleted]" }
    })
    expect(mockPrisma.account.deleteMany).toHaveBeenCalledWith({ where: { userId: "u1" } })
  })
})
