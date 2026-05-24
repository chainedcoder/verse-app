import { prisma } from "@/lib/prisma"
import PoemCard from "@/components/PoemCard"
import Link from "next/link"

export const metadata = {
  title: "Search | Verse",
  description: "Search for poems, authors, and tags."
}

export default async function SearchPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams.q || ""
  
  let poems = []
  
  if (query) {
    poems = await prisma.poem.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { fullText: { contains: query } },
          { tags: { contains: query } },
          { author: { name: { contains: query } } }
        ]
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        _count: { select: { likes: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  }

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <h1 className="serif" style={{ fontSize: "36px", marginBottom: "24px" }}>Search</h1>
      
      <form action="/search" style={{ marginBottom: "40px", display: "flex", gap: "12px", maxWidth: "600px" }}>
        <input 
          type="search" 
          name="q" 
          defaultValue={query} 
          placeholder="Search poems, authors, tags..." 
          className="input" 
          style={{ flexGrow: 1, padding: "12px 16px", fontSize: "16px" }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {query && (
        <div style={{ marginBottom: "24px", color: "var(--text-secondary)" }}>
          Found {poems.length} result{poems.length !== 1 ? 's' : ''} for <strong style={{ color: "var(--text-primary)" }}>&quot;{query}&quot;</strong>
        </div>
      )}

      {!query ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)" }}>
          <i className="ti ti-search" style={{ fontSize: "48px", marginBottom: "16px", display: "block" }}></i>
          <p>Enter a search term to find poems and authors.</p>
        </div>
      ) : poems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-tertiary)" }}>
          <i className="ti ti-mood-empty" style={{ fontSize: "48px", marginBottom: "16px", display: "block" }}></i>
          <p>No results found. Try a different search term.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
          {poems.map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  )
}
