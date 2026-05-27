import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Card from "@/components/Card"

export const metadata = {
  title: "Collections | Verse",
  description: "Curated collections of poetry."
}

import { auth } from "@/auth"

export default async function Collections() {
  const session = await auth()
  const collections = await prisma.collection.findMany({
    where: { isPublic: true, status: { not: "DELETED" } },
    include: {
      author: { select: { name: true, id: true } },
      _count: { select: { poems: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 className="serif" style={{ fontSize: "36px" }}>Collections</h1>
        <Link href="/collections/create" className="btn btn-primary btn-sm">Create New</Link>
      </div>
      
      {collections.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-folders" aria-hidden="true"></i>
          <p>No collections found. Be the first to create one!</p>
        </div>
      ) : (
        <div className="collections-grid">
          {collections.map(collection => (
            <Link href={`/collections/${collection.id}`} key={collection.id} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <Card isMine={session?.user?.id === collection.authorId} style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
                <h3 className="serif" style={{ fontSize: "22px", marginBottom: "8px" }}>{collection.name}</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "16px", flexGrow: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {collection.description || "No description provided."}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)", fontSize: "14px" }}>
                  <span>
                    {session?.user?.id === collection.authorId 
                      ? (<><i className="ti ti-pencil" style={{ fontSize: "11px", marginRight: "4px", opacity: 0.7 }} aria-hidden="true" />You</>)
                      : `By ${collection.author?.name || "Unknown"}`
                    }
                  </span>
                  <span>{collection._count.poems} {collection._count.poems === 1 ? "poem" : "poems"}</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
