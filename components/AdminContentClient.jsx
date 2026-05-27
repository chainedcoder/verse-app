"use client"

import { useState, useTransition } from "react"
import { togglePoemFeatured, deletePoemAdmin } from "@/app/actions/admin"
import Link from "next/link"
import Avatar from "./Avatar"
import Pagination from "./Pagination"

const ITEMS_PER_PAGE = 10

export default function AdminContentClient({ initialPoems, currentUserRole }) {
  const [poems, setPoems] = useState(initialPoems)
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("ALL")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPoems = poems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchesSearch) return false
    
    if (filter === "FEATURED") return p.featured
    if (filter === "DELETED") return p.status === "DELETED"
    if (filter === "PUBLISHED") return p.status === "PUBLISHED"
    return true
  })

  const totalPages = Math.ceil(filteredPoems.length / ITEMS_PER_PAGE)
  const paginatedPoems = filteredPoems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleToggleFeature = (poemId, currentFeatured) => {
    startTransition(async () => {
      const res = await togglePoemFeatured(poemId, !currentFeatured)
      if (res.success) {
        setPoems(prev => prev.map(p => p.id === poemId ? { ...p, featured: !currentFeatured } : p))
      } else {
        alert(res.error)
      }
    })
  }

  const handleDelete = (poemId) => {
    if (!confirm("Are you sure you want to delete this poem?")) return

    startTransition(async () => {
      const res = await deletePoemAdmin(poemId)
      if (res.success) {
        setPoems(prev => prev.map(p => p.id === poemId ? { ...p, status: "DELETED" } : p))
      } else {
        alert(res.error)
      }
    })
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <input 
          type="search" 
          placeholder="Search poems by title or excerpt..." 
          className="input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1, minWidth: "200px" }}
        />
        <select 
          className="input" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          style={{ width: "auto" }}
        >
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="FEATURED">Featured</option>
          <option value="DELETED">Deleted</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-secondary)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "12px 8px" }}>Poem</th>
              <th style={{ padding: "12px 8px" }}>Author</th>
              <th style={{ padding: "12px 8px" }}>Status</th>
              <th style={{ padding: "12px 8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPoems.map(poem => (
              <tr key={poem.id} style={{ borderBottom: "1px solid var(--border-tertiary)", opacity: poem.status === "DELETED" ? 0.5 : 1 }}>
                <td style={{ padding: "12px 8px", maxWidth: "300px" }}>
                  <Link href={`/poem/${poem.id}`} style={{ fontWeight: "600", color: "var(--primary)", textDecoration: "none", display: "block", marginBottom: "4px" }}>
                    {poem.title}
                  </Link>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {poem.excerpt}
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Avatar image={poem.author.image} name={poem.author.name} size="sm" />
                    <Link href={`/author/${poem.author.id}`} style={{ fontSize: "12px", color: "var(--text-secondary)", textDecoration: "none" }}>
                      {poem.author.name}
                    </Link>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: poem.status === "PUBLISHED" ? "var(--bg-card)" : "var(--danger)", color: poem.status === "PUBLISHED" ? "inherit" : "white", border: "1px solid var(--border-tertiary)" }}>
                      {poem.status}
                    </span>
                    {poem.featured && (
                      <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "var(--primary)", color: "var(--bg-primary)" }}>
                        FEATURED
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleToggleFeature(poem.id, poem.featured)}
                      disabled={isPending || poem.status === "DELETED"}
                    >
                      {poem.featured ? "Unfeature" : "Feature"}
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: "var(--danger)", fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleDelete(poem.id)}
                      disabled={isPending || poem.status === "DELETED"}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedPoems.length === 0 && (
          <div className="empty-state" style={{ padding: "32px 0" }}>No poems found.</div>
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}
