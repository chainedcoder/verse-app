import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import FeedClient from "@/components/FeedClient"

export default async function Home() {
  const session = await auth()
  
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

  let likedPoemIds = []
  let followedAuthorIds = []

  if (session?.user?.id) {
    const userId = session.user.id
    
    const [userLikes, userFollows] = await Promise.all([
      prisma.like.findMany({
        where: { userId },
        select: { poemId: true }
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
      })
    ])

    likedPoemIds = userLikes.map(l => l.poemId)
    followedAuthorIds = userFollows.map(f => f.followingId)
  }

  // Extract all unique tags
  const tagsSet = new Set()
  poems.forEach(p => {
    if (p.tags) {
      p.tags.split(',').forEach(t => tagsSet.add(t.trim()))
    }
  })
  const tags = Array.from(tagsSet).filter(Boolean)

  return (
    <FeedClient 
      initialPoems={poems} 
      tags={tags} 
      trendingAuthors={trendingAuthors} 
      initialLikedPoemIds={likedPoemIds}
      initialFollowedAuthorIds={followedAuthorIds}
    />
  )
}
