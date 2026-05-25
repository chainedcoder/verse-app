import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { authors, poems } from "../legacy/js/data.js"

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Seeding data...')

  // Insert authors as Users
  for (const author of authors) {
    await prisma.user.upsert({
      where: { id: author.id },
      update: {
        name: author.name,
        bio: author.bio,
        location: author.location,
        image: author.avatarClass,
      },
      create: {
        id: author.id,
        name: author.name,
        bio: author.bio,
        location: author.location,
        image: author.avatarClass,
      },
    })
    console.log(`Upserted user ${author.id}`)
  }

  // Insert poems
  for (const poem of poems) {
    await prisma.poem.upsert({
      where: { id: poem.id },
      update: {
        title: poem.title,
        excerpt: poem.excerpt,
        fullText: poem.fullText,
        tags: { connectOrCreate: poem.tags.map(tag => ({ where: { name: tag }, create: { name: tag } })) },
        featured: poem.featured || false,
        authorId: poem.authorId,
      },
      create: {
        id: poem.id,
        title: poem.title,
        excerpt: poem.excerpt,
        fullText: poem.fullText,
        tags: { connectOrCreate: poem.tags.map(tag => ({ where: { name: tag }, create: { name: tag } })) },
        featured: poem.featured || false,
        authorId: poem.authorId,
      },
    })
    
    console.log(`Upserted poem ${poem.id}`)
  }

  console.log('Seeding finished.')
  await prisma.$disconnect()
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
