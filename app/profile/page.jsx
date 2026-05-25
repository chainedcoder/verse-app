import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ProfileClient from "@/components/ProfileClient"

export const metadata = {
  title: "My Profile | Verse"
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      followers: { include: { follower: { select: { id: true, name: true, image: true, bio: true } } } },
      following: { include: { following: { select: { id: true, name: true, image: true, bio: true } } } },
      poems: {
        where: { status: { not: "DELETED" } },
        include: {
          _count: {
            select: { likes: true }
          },
          tags: true
        },
        orderBy: { createdAt: 'desc' }
      },
      likes: {
        include: {
          poem: {
            include: {
              author: { select: { id: true, name: true, image: true } },
              _count: { select: { likes: true } },
              tags: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      collections: {
        where: { status: { not: "DELETED" } },
        include: {
          _count: { select: { poems: true } }
        },
        orderBy: { updatedAt: 'desc' }
      },
      _count: {
        select: { poems: true, followers: true, following: true }
      }
    }
  })

  if (!user) {
    redirect("/login")
  }

  // Map user data
  user.poemsCount = user._count?.poems || 0
  user.readersCount = user._count?.followers || 0
  user.followingCount = user._count?.following || 0
  
  user.followersList = user.followers?.map(f => f.follower) || []
  user.followingList = user.following?.map(f => f.following) || []
  user.initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'
  
  // Extract liked poems safely
  const likedPoems = user.likes.filter(l => l.poem && l.poem.status !== "DELETED").map(l => l.poem)
  
  // Create a set of liked poem IDs for the client component
  const likedPoemIds = user.likes.map(l => l.poemId)

  return (
    <ProfileClient 
      user={user} 
      poems={user.poems} 
      likedPoems={likedPoems}
      collections={user.collections}
      initialLikedPoemIds={likedPoemIds} 
    />
  )
}
