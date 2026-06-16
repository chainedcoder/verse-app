import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const globalForPrisma = globalThis

// Force re-initialization if the cached Prisma client doesn't support the new models
if (globalForPrisma.prisma && !globalForPrisma.prisma.permissionGroup) {
  delete globalForPrisma.prisma
}

if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 50 })
  const adapter = new PrismaPg(pool)
  globalForPrisma.prisma = new PrismaClient({ adapter })
  globalForPrisma.prismaPool = pool
}

export const prisma = globalForPrisma.prisma
