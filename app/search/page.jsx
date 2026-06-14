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
        status: { not: "DELETED" },
        isPrivate: false,
        OR: [
          { title: { contains: query } },
          { fullText: { contains: query } },
          { tags: { some: { name: { contains: query } } } },
          { author: { name: { contains: query } } }
        ]
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
      <h1 className="poem-viewer-title serif" style={{ marginBottom: "32px" }}>Search</h1>
      
      <form action="/search" style={{ display: "flex", gap: "12px", marginBottom: "40px" }}>
        <input 
          type="search" 
          name="q" 
          defaultValue={query} 
          placeholder="Search poems, authors, tags..." 
          className="input" 
          style={{ flexGrow: 1 }}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {query && (
        <p className="search-results-count">
          Found <strong>{poems.length}</strong> result{poems.length !== 1 ? 's' : ''} for <em>&ldquo;{query}&rdquo;</em>
        </p>
      )}

      {!query ? (
        <div className="empty-state">
          <i className="ti ti-search"></i>
          <p>Enter a search term to find poems and authors.</p>
        </div>
      ) : poems.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-mood-empty"></i>
          <p>No results found. Try a different search term.</p>
        </div>
      ) : (
        <div className="search-results-grid">
          {JSON.parse(JSON.stringify(poems)).map(poem => (
            <PoemCard key={poem.id} poem={poem} />
          ))}
        </div>
      )}
    </div>
  )
}
