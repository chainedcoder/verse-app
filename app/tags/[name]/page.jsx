import { prisma } from "@/lib/prisma"
import PoemCard from "@/components/PoemCard"
import Link from "next/link"

export async function generateMetadata(props) {
  const params = await props.params
  const decodedName = decodeURIComponent(params.name)
  return {
    title: `Poems tagged with #${decodedName} | Verse`,
    description: `Discover poetry and lyrics about ${decodedName} on Verse.`
  }
}

export default async function TagDetailPage(props) {
  const params = await props.params
  const decodedName = decodeURIComponent(params.name)

  const tag = await prisma.tag.findUnique({
    where: { name: decodedName }
  })

  let poems = []
  
  if (tag) {
    poems = await prisma.poem.findMany({
      where: {
        status: "PUBLISHED",
        isPrivate: false,
        tags: { some: { id: tag.id } }
      },
      include: {
        tags: true,
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  }

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Link href="/tags" className="btn btn-ghost btn-icon">
          <i className="ti ti-arrow-left"></i>
        </Link>
        <h1 className="poem-viewer-title serif" style={{ margin: 0 }}>#{decodedName}</h1>
      </div>
      
      <p className="search-results-count" style={{ marginBottom: "32px" }}>
        Found <strong>{poems.length}</strong> poem{poems.length !== 1 ? 's' : ''} with this tag
      </p>

      {poems.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-feather"></i>
          <p>No poems found for this tag.</p>
          <Link href="/" className="btn btn-primary" style={{ marginTop: "16px" }}>Back to feed</Link>
        </div>
      ) : (
        <div className="search-results-grid">
          {poems.map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  )
}
