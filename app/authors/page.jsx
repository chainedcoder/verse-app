import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Avatar from "@/components/Avatar"
import Card from "@/components/Card"
import styles from "./authors.module.css"

export const metadata = {
  title: "Authors | Verse",
  description: "Browse poets and writers on Verse. Discover their collections and read their poems.",
  openGraph: {
    title: "Authors | Verse",
    description: "Browse poets and writers on Verse. Discover their collections and read their poems.",
    type: "website"
  }
}

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
    <div className="page-container">
      <h1 className="serif" style={{ marginBottom: "24px" }}>Authors</h1>
      <div className="author-list-grid">
        {JSON.parse(JSON.stringify(authorsList)).map(author => (
          <Link key={author.id} href={`/author/${author.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <Card clickable style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <Avatar image={author.image} name={author.name} size="lg" />
              <div>
                <div className={`${styles['author-name']} author-name`}>{author.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>{author.poemsCount} poems</div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
