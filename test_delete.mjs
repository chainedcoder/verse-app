import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function run() {
  const poem = await prisma.poem.findFirst()
  console.log("Poem to delete:", poem.id)
  await prisma.poem.delete({ where: { id: poem.id } })
  console.log("Deleted!")
}
run().catch(console.error).finally(() => prisma.$disconnect())
