"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleLike } from "@/app/actions/interactions"

function estimateReadTime(text) {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return minutes < 1 ? 1 : minutes
}

export default function PoemCard({ poem, initialLiked = false, onRemove = null, customRemoveButton = null, isMine = false }) {
  const router = useRouter()
  // poem.author is included from Prisma query
  const author = poem.author
  
  const [copied, setCopied] = useState(false)
  
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
  const [isPending, startTransition] = useTransition()
  
  const readTime = estimateReadTime(poem.fullText || poem.excerpt)

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Optimistic UI update
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    
    startTransition(async () => {
      await toggleLike(poem.id)
    })
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/poem/${poem.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!author) return null

  const tagsList = poem.tags ? poem.tags.map(t => t.name) : []
  
  // compute initials
  const initials = author.name ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'

  return (
    <div onClick={() => router.push(`/poem/${poem.id}`)} style={{ cursor: "pointer", display: "block", position: "relative" }} className="poem-card-container">
      {customRemoveButton}
      <div className={`card card-clickable poem-card-featured${isMine ? " poem-card--mine" : ""}`} style={{ marginBottom: "16px" }}>
        {poem.featured && <span className="badge badge-featured">featured</span>}
        <div className="category-label" style={{ marginBottom: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {tagsList.map((t, i) => (
            <span key={t}>
              <Link href={`/search?q=${encodeURIComponent(t)}`} onClick={e => e.stopPropagation()} style={{ color: "inherit", textDecoration: "none" }}>
                #{t}
              </Link>
              {i < tagsList.length - 1 && " · "}
            </span>
          ))}
        </div>
        <h2 className="serif" style={{ fontSize: "22px", marginBottom: "12px", letterSpacing: "-0.3px" }}>{poem.title}</h2>
        <div className="poem-excerpt" style={{ fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: poem.excerpt.replace(/\n/g, "<br>") }} />
        
        <div className="card-footer">
          <div className="author-info">
            <Link href={`/author/${poem.authorId}`} className="author-info" style={{ textDecoration: "none", color: "inherit" }} onClick={e => e.stopPropagation()}>
              {author.image ? (
                <img src={author.image} alt={author.name} className="avatar avatar-sm" style={{ objectFit: "cover" }} />
              ) : (
                <div className="avatar avatar-sm avatar-warm">{initials}</div>
              )}
              <div>
                <div className="author-name">
                  {isMine ? (<><i className="ti ti-pencil" style={{ fontSize: "11px", marginRight: "4px", opacity: 0.7 }} aria-hidden="true" />You</>) : author.name}
                </div>
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
              <i className={`ti ${copied ? "ti-check" : "ti-share"}`} style={{ fontSize: "16px", color: copied ? "var(--primary)" : "inherit" }} aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
