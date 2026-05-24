import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import PoemCard from "@/components/PoemCard"
import Link from "next/link"

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
        include: {
          author: { select: { name: true, image: true } },
          _count: { select: { likes: true } }
        }
      }
    }
  })

  if (!collection) {
    notFound()
  }

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
        {collection.poems.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
            <p style={{ color: "var(--text-secondary)" }}>This collection is empty.</p>
          </div>
        ) : (
          collection.poems.map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))
        )}
      </div>
    </div>
  )
}
