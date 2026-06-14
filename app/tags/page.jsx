import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = {
  title: "Tags | Verse",
  description: "Browse poems by topic and theme."
}

export default async function TagsPage() {
  // Fetch tags and count how many published/public poems each has
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          poems: {
            where: {
              status: "PUBLISHED",
              isPrivate: false
            }
          }
        }
      }
    },
    orderBy: {
      poems: {
        _count: 'desc'
      }
    }
  })

  // Filter out tags that have 0 visible poems
  const visibleTags = tags.filter(t => t._count.poems > 0)

  return (
    <div className="container" style={{ padding: "48px 24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 className="poem-viewer-title serif" style={{ marginBottom: "32px" }}>Browse Topics</h1>
      
      {visibleTags.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-tags"></i>
          <p>No tags found. Start writing and adding tags to your poems!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
          {JSON.parse(JSON.stringify(visibleTags)).map(tag => (
            <Link 
              key={tag.id} 
              href={`/tags/${encodeURIComponent(tag.name)}`}
              style={{ textDecoration: "none" }}
            >
              <div className="card card-compact" style={{ padding: "12px 20px", display: "flex", alignItems: "center", gap: "8px", transition: "transform 0.2s, box-shadow 0.2s" }}>
                <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>#{tag.name}</span>
                <span className="badge" style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
                  {tag._count.poems}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
