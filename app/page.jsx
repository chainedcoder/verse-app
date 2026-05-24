import { prisma } from "@/lib/prisma"
import FeedClient from "@/components/FeedClient"

export default async function Home() {
  const poems = await prisma.poem.findMany({
    include: {
      author: true,
      _count: {
        select: { likes: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const trendingAuthors = await prisma.user.findMany({
    take: 3,
  })

  // Extract all unique tags
  const tagsSet = new Set()
  poems.forEach(p => {
    if (p.tags) {
      p.tags.split(',').forEach(t => tagsSet.add(t.trim()))
    }
  })
  const tags = Array.from(tagsSet).filter(Boolean)

  return <FeedClient initialPoems={poems} tags={tags} trendingAuthors={trendingAuthors} />
}
