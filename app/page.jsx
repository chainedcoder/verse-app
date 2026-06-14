import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import FeedClient from "@/components/FeedClient"

export default async function Home() {
  const session = await auth()
  
  const limit = 6

  // Base regular where clause
  const regularWhere = {
    status: { not: "DELETED" },
    featured: false,
    ...(session?.user?.id
      ? {
          OR: [
            { isPrivate: false },
            { authorId: session.user.id }
          ]
        }
      : { isPrivate: false })
  }

  // Base featured where clause
  const featuredWhere = {
    status: { not: "DELETED" },
    featured: true,
    ...(session?.user?.id
      ? {
          OR: [
            { isPrivate: false },
            { authorId: session.user.id }
          ]
        }
      : { isPrivate: false })
  }

  // Run database queries concurrently
  const [initialPoemsRaw, featuredPoemsRaw, trendingAuthorsRaw, allTagsRaw] = await Promise.all([
    prisma.poem.findMany({
      where: regularWhere,
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        tags: true,
        _count: {
          select: { likes: true }
        }
      }
    }),
    prisma.poem.findMany({
      where: featuredWhere,
      orderBy: { createdAt: 'desc' },
      include: {
        author: true,
        tags: true,
        _count: {
          select: { likes: true }
        }
      }
    }),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      take: 4,
    }),
    prisma.tag.findMany({
      select: { name: true }
    })
  ])

  // Safely serialize database model dates to match Client Component expectations
  const initialPoems = JSON.parse(JSON.stringify(initialPoemsRaw))
  const featuredPoems = JSON.parse(JSON.stringify(featuredPoemsRaw))

  let initialNextCursor = null
  if (initialPoems.length > limit) {
    const nextItem = initialPoems.pop()
    initialNextCursor = nextItem.id
  }

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

  const tags = allTagsRaw.map(t => t.name).filter(Boolean)

  const trendingAuthors = JSON.parse(JSON.stringify(trendingAuthorsRaw))
    .filter(a => a.id !== session?.user?.id)
    .slice(0, 3)

  return (
    <FeedClient 
      initialPoems={initialPoems}
      featuredPoems={featuredPoems}
      tags={tags} 
      trendingAuthors={trendingAuthors} 
      initialLikedPoemIds={likedPoemIds}
      initialFollowedAuthorIds={followedAuthorIds}
      currentUserId={session?.user?.id}
      initialNextCursor={initialNextCursor}
    />
  )
}

