"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { isLiked, toggleLike } from "@/lib/data"

function estimateReadTime(text) {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return minutes < 1 ? 1 : minutes
}

export default function PoemCard({ poem }) {
  const router = useRouter()
  // poem.author is included from Prisma query
  const author = poem.author
  
  const [liked, setLiked] = useState(isLiked(poem.id))
  const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
  
  const readTime = estimateReadTime(poem.fullText || poem.excerpt)

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const nowLiked = toggleLike(poem.id)
    setLiked(nowLiked)
    setLikeCount(prev => nowLiked ? prev + 1 : prev - 1)
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/poem/${poem.id}`
    navigator.clipboard.writeText(url).then(() => {
      alert("Link copied!")
    })
  }

  if (!author) return null

  // Tags are stored as a comma-separated string in the DB
  const tagsList = poem.tags ? poem.tags.split(',') : []
  
  // compute initials
  const initials = author.name ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'

  return (
    <div onClick={() => router.push(`/poem/${poem.id}`)} style={{ cursor: "pointer", display: "block" }}>
      <div className="card card-clickable poem-card-featured" style={{ marginBottom: "16px" }}>
        {poem.featured && <span className="badge badge-featured">featured</span>}
        <div className="category-label" style={{ marginBottom: "6px" }}>{tagsList.join(" · ")}</div>
        <h2 className="serif" style={{ fontSize: "22px", marginBottom: "12px", letterSpacing: "-0.3px" }}>{poem.title}</h2>
        <div className="poem-excerpt" style={{ fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: poem.excerpt.replace(/\n/g, "<br>") }} />
        
        <div className="card-footer">
          <div className="author-info">
            <Link href={`/author/${poem.authorId}`} className="author-info" style={{ textDecoration: "none", color: "inherit" }} onClick={e => e.stopPropagation()}>
              <div className={`avatar avatar-sm ${author.image}`}>{initials}</div>
              <div>
                <div className="author-name">{author.name}</div>
                <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                  <span suppressHydrationWarning>{poem.createdAt ? new Date(poem.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'Recently'}</span> · {readTime} min read
                </div>
              </div>
            </Link>
          </div>
          
          <div className="action-icons">
            <button className={`action-icon ${liked ? "liked" : ""}`} onClick={handleLike} aria-label="Like">
              <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: "16px" }} aria-hidden="true"></i>
              <span className="like-count" style={{ marginLeft: "4px" }}>{likeCount}</span>
            </button>
            <Link href={`/export/${poem.id}`} className="action-icon" onClick={e => e.stopPropagation()} aria-label="Download">
              <i className="ti ti-download" style={{ fontSize: "16px" }} aria-hidden="true"></i>
            </Link>
            <button className="action-icon" onClick={handleShare} aria-label="Share">
              <i className="ti ti-share" style={{ fontSize: "16px" }} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
