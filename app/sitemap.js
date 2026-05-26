import { prisma } from "@/lib/prisma"

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/collections`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/authors`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ]

  let poems = []
  let authors = []
  let collections = []

  try {
    poems = await prisma.poem.findMany({
      where: {
        status: "PUBLISHED",
        isPrivate: false,
      },
      select: { id: true, createdAt: true },
    })

    authors = await prisma.user.findMany({
      where: {
        status: "ACTIVE",
      },
      select: { id: true, updatedAt: true },
    })

    collections = await prisma.collection.findMany({
      where: {
        status: "ACTIVE",
        isPublic: true,
      },
      select: { id: true, updatedAt: true },
    })
  } catch (error) {
    console.error("Error generating sitemap data:", error)
  }

  const poemEntries = poems.map((poem) => ({
    url: `${baseUrl}/poem/${poem.id}`,
    lastModified: poem.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const authorEntries = authors.map((author) => ({
    url: `${baseUrl}/author/${author.id}`,
    lastModified: author.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  const collectionEntries = collections.map((collection) => ({
    url: `${baseUrl}/collections/${collection.id}`,
    lastModified: collection.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  return [...staticPages, ...poemEntries, ...authorEntries, ...collectionEntries]
}
