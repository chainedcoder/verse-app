import { prisma } from "@/lib/prisma"
import Link from "next/link"

export const metadata = {
  title: "Collections | Verse",
  description: "Curated collections of poetry."
}

export default async function Collections() {
  const collections = await prisma.collection.findMany({
    where: { isPublic: true },
    include: {
      author: { select: { name: true, id: true } },
      _count: { select: { poems: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 className="serif" style={{ fontSize: "36px" }}>Collections</h1>
        <Link href="/collections/create" className="btn btn-primary btn-sm">Create New</Link>
      </div>
      
      {collections.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <i className="ti ti-folders" style={{ fontSize: "48px", color: "var(--text-tertiary)", marginBottom: "16px", display: "block" }}></i>
          <p style={{ color: "var(--text-secondary)" }}>No collections found. Be the first to create one!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {collections.map(collection => (
            <Link href={`/collections/${collection.id}`} key={collection.id} style={{ display: "block", textDecoration: "none", color: "inherit" }}>
              <div className="card" style={{ padding: "24px", height: "100%", display: "flex", flexDirection: "column" }}>
                <h3 className="serif" style={{ fontSize: "22px", marginBottom: "8px" }}>{collection.name}</h3>
                <p style={{ color: "var(--text-secondary)", marginBottom: "16px", flexGrow: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {collection.description || "No description provided."}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-tertiary)", fontSize: "14px" }}>
                  <span>By {collection.author?.name || "Unknown"}</span>
                  <span>{collection._count.poems} {collection._count.poems === 1 ? "poem" : "poems"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
