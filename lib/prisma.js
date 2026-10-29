import { PrismaClient } from "@prisma/client"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { withPoolDefaults } from "./databaseUrl.js"

const globalForPrisma = globalThis

// Force re-initialization if the cached Prisma client doesn't support the new models
if (globalForPrisma.prisma && (!globalForPrisma.prisma.permissionGroup || !globalForPrisma.prisma.ticket)) {
  // Close the stale client's pool so it doesn't keep holding connections
  globalForPrisma.prisma.$disconnect().catch(() => {})
  delete globalForPrisma.prisma
}

if (!globalForPrisma.prisma) {
  const adapter = new PrismaMariaDb(withPoolDefaults(process.env.DATABASE_URL))
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma
