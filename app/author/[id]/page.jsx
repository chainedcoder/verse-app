import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import Link from "next/link"
import AuthorPageClient from "@/components/AuthorPageClient"

export default async function AuthorPage(props) {
  const params = await props.params
  const authorId = params.id

  const session = await auth()

  const author = await prisma.user.findUnique({
    where: { id: authorId },
    include: {
      poems: {
        include: {
          _count: {
            select: { likes: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: { poems: true, followers: true }
      }
    }
  })

  if (!author) {
    return (
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <i className="ti ti-user-off" style={{ fontSize: "48px", color: "var(--text-tertiary)", marginBottom: "16px", display: "block" }}></i>
        <h2 style={{ marginBottom: "8px" }}>Author not found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>The author you're looking for doesn't exist.</p>
        <Link href="/" className="btn btn-primary">Back to feed</Link>
      </div>
    )
  }

  // Map author counts and initials
  author.poemsCount = author._count?.poems || 0
  author.readersCount = author._count?.followers || 0
  author.initials = author.name ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'

  let isFollowing = false
  let likedPoemIds = []

  if (session?.user?.id) {
    const userId = session.user.id
    
    const [followRecord, userLikes] = await Promise.all([
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: authorId } }
      }),
      prisma.like.findMany({
        where: { 
          userId,
          poem: { authorId }
        },
        select: { poemId: true }
      })
    ])

    isFollowing = !!followRecord
    likedPoemIds = userLikes.map(l => l.poemId)
  }

  return (
    <AuthorPageClient 
      author={author} 
      poems={author.poems} 
      initialFollowing={isFollowing} 
      initialLikedPoemIds={likedPoemIds} 
    />
  )
}
