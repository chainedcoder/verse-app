import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import PoemPageClient from "@/components/PoemPageClient"

export async function generateMetadata(props) {
  const params = await props.params
  const poem = await prisma.poem.findUnique({
    where: { id: params.id },
    include: { author: true }
  })

  if (!poem) return { title: "Poem not found" }

  const plainExcerpt = poem.excerpt.replace(/<[^>]+>/g, '')

  return {
    title: `${poem.title} by ${poem.author.name} | Verse`,
    description: plainExcerpt,
    openGraph: {
      title: poem.title,
      description: plainExcerpt,
      type: "article",
      authors: [poem.author.name],
    },
    twitter: {
      card: "summary_large_image",
      title: poem.title,
      description: plainExcerpt,
    }
  }
}

export default async function PoemPage(props) {
  const params = await props.params
  const poemId = params.id

  const session = await auth()

  const poem = await prisma.poem.findUnique({
    where: { id: poemId },
    include: {
      tags: true,
      author: {
        include: {
          _count: {
            select: { poems: true, followers: true }
          }
        }
      },
      _count: {
        select: { likes: true }
      }
    }
  })

  if (!poem || poem.status === "DELETED" || (poem.isPrivate && poem.authorId !== session?.user?.id)) {
    return (
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <i className="ti ti-lock" style={{ fontSize: "48px", color: "var(--text-tertiary)", marginBottom: "16px", display: "block" }}></i>
        <h2 style={{ marginBottom: "8px" }}>Poem unavailable</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>The poem you're looking for doesn't exist or is private.</p>
        <Link href="/" className="btn btn-primary">Back to feed</Link>
      </div>
    )
  }

  // Map author counts for AuthorCard compatibility
  poem.author.poems = poem.author._count?.poems || 0
  poem.author.readers = poem.author._count?.followers || 0
  poem.author.initials = poem.author.name ? poem.author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'

  let isLiked = false
  let isFollowingAuthor = false
  let userCollections = []
  let userId = null

  if (session?.user?.id) {
    userId = session.user.id
    
    const [likeRecord, followRecord, collections] = await Promise.all([
      prisma.like.findUnique({
        where: { poemId_userId: { poemId, userId } }
      }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: poem.authorId } }
      }),
      prisma.collection.findMany({
        where: { authorId: userId },
        include: { poems: { select: { id: true } } }
      })
    ])

    isLiked = !!likeRecord
    isFollowingAuthor = !!followRecord
    userCollections = collections.map(c => ({
      ...c,
      hasPoem: c.poems.some(p => p.id === poemId)
    }))
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    headline: poem.title,
    author: {
      '@type': 'Person',
      name: poem.author.name
    },
    text: poem.excerpt.replace(/<[^>]+>/g, ''),
    dateCreated: poem.createdAt.toISOString()
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PoemPageClient 
        poem={poem} 
        initialLiked={isLiked} 
        initialFollowingAuthor={isFollowingAuthor} 
        userCollections={userCollections}
        userId={userId}
      />
    </>
  )
}
