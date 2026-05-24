import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
  const prisma = new PrismaClient({ adapter })
  
  const user = await prisma.user.findFirst()
  console.log(user)
}

main().catch(console.error)
