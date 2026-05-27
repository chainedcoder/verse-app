import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PoemCard from "@/components/PoemCard"
import RemovablePoemCard from "@/components/RemovablePoemCard"
import Link from "next/link"
import { auth } from "@/auth"
import CollectionManager from "@/components/CollectionManager"

export async function generateMetadata(props) {
  const params = await props.params;
  const collection = await prisma.collection.findUnique({
    where: { id: params.id }
  })
  
  if (!collection) return { title: "Not Found" }
  
  return {
    title: `${collection.name} | Verse`,
    description: collection.description || "A curated collection of poetry."
  }
}

export default async function CollectionDetailPage(props) {
  const params = await props.params;
  const collection = await prisma.collection.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true } },
      poems: {
        where: { status: { not: "DELETED" } },
        include: {
          author: { select: { name: true, image: true, id: true } },
          _count: { select: { likes: true } }
        }
      }
    }
  })

  if (!collection || collection.status === "DELETED") {
    notFound()
  }

  const session = await auth()
  const isAuthor = session?.user?.id === collection.authorId

  let allUserPoems = []
  if (isAuthor) {
    const rawUserPoems = await prisma.poem.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, status: true }
    })
    allUserPoems = JSON.parse(JSON.stringify(rawUserPoems))
  }

  const collectionData = JSON.parse(JSON.stringify(collection))

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1 className="serif" style={{ fontSize: "42px", marginBottom: "12px" }}>{collection.name}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "18px", maxWidth: "600px", margin: "0 auto 16px auto" }}>
          {collection.description}
        </p>
        <div style={{ color: "var(--text-tertiary)" }}>
          Curated by <Link href={`/author/${collection.authorId}`} style={{ color: "var(--primary)" }}>{collection.author?.name}</Link>
          <span style={{ margin: "0 8px" }}>•</span>
          {collection.isPublic ? "Public" : "Private"}
        </div>
      </div>

      {isAuthor && (
        <CollectionManager collection={collectionData} allUserPoems={allUserPoems} />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {collection.poems.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>This collection is empty.</p>
          </div>
        ) : (
          collection.poems.map(poem => (
            isAuthor ? (
              <RemovablePoemCard key={poem.id} poem={poem} collectionId={collection.id} isMine={poem.authorId === session?.user?.id} />
            ) : (
              <PoemCard key={poem.id} poem={poem} isMine={poem.authorId === session?.user?.id} />
            )
          ))
        )}
      </div>
    </div>
  )
}
