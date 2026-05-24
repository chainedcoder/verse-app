import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function Authors() {
  const authors = await prisma.user.findMany({
    include: {
      _count: {
        select: { poems: true }
      }
    }
  })

  // Filter out authors with 0 poems if desired, but we'll show all
  const authorsList = authors.map(author => ({
    ...author,
    poemsCount: author._count?.poems || 0,
    initials: author.name ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'
  }))

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 className="serif" style={{ marginBottom: "24px" }}>Authors</h1>
      <div className="author-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {authorsList.map(author => (
          <Link key={author.id} href={`/author/${author.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card card-clickable" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className={`avatar avatar-lg ${author.image}`}>{author.initials}</div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{author.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>{author.poemsCount} poems</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
