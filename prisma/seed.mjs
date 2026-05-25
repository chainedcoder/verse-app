import { PrismaClient } from "@prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { authors, poems } from "../lib/data.js"

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" })
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
    
    // Create initial likes count if we wanted (or just rely on the DB)
    // The previous likes was a number, but in Prisma it's relation.
    // For now we just create the poems.
    console.log(`Upserted poem ${poem.id}`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // Prisma disconnected automatically but we can ensure process exits
  })
