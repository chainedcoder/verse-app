import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import FeedClient from "@/components/FeedClient"

export default async function Home() {
  const session = await auth()
  
  const whereClause = {
    status: { not: "DELETED" },
    ...(session?.user?.id
      ? {
          OR: [
            { isPrivate: false },
            { authorId: session.user.id }
          ]
        }
      : { isPrivate: false })
  }

  const poems = await prisma.poem.findMany({
    where: whereClause,
    include: {
      author: true,
      tags: true,
      _count: {
        select: { likes: true }
      }
    },
    orderBy: [
      { featured: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  const trendingAuthorsRaw = await prisma.user.findMany({
    take: 4,
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
    if (Array.isArray(p.tags)) {
      p.tags.forEach(t => tagsSet.add(t.name))
    }
  })
  const tags = Array.from(tagsSet).filter(Boolean)

  const featuredPoems = poems.filter(p => p.featured)
  const regularPoems  = poems.filter(p => !p.featured)

  const trendingAuthors = trendingAuthorsRaw
    .filter(a => a.id !== session?.user?.id)
    .slice(0, 3)

  return (
    <FeedClient 
      initialPoems={regularPoems}
      featuredPoems={featuredPoems}
      tags={tags} 
      trendingAuthors={trendingAuthors} 
      initialLikedPoemIds={likedPoemIds}
      initialFollowedAuthorIds={followedAuthorIds}
      currentUserId={session?.user?.id}
    />
  )
}
