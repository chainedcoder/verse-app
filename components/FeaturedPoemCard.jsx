"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleLike } from "@/app/actions/interactions"

function estimateReadTime(text) {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function FeaturedPoemCard({ poem, initialLiked = false, isMine = false }) {
  const router = useRouter()
  // poem.author is included from Prisma query
  const author = poem.author

  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
  const [isPending, startTransition] = useTransition()

  const readTime = estimateReadTime(poem.fullText || poem.excerpt)

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(prev => !prev)
    setLikeCount(prev => liked ? prev - 1 : prev + 1)
    startTransition(async () => { await toggleLike(poem.id) })
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/poem/${poem.id}`
    navigator.clipboard.writeText(url).then(() => alert("Link copied!"))
  }

  if (!author) return null

  const tagsList = poem.tags ? poem.tags.map(t => t.name) : []
  const initials = author.name
    ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?'

  return (
    <div
      className={`featured-poem-card${isMine ? " poem-card--mine" : ""}`}
      onClick={() => router.push(`/poem/${poem.id}`)}
      role="article"
      aria-label={`Featured poem: ${poem.title}`}
    >
      {/* Accent bar */}
      <div className="featured-poem-card__accent" aria-hidden="true" />

      <div className="featured-poem-card__body">
        {/* Header row */}
        <div className="featured-poem-card__header">
          <div className="featured-poem-card__meta">
            {poem.featured && (
              <span className="badge badge-featured">
                <i className="ti ti-star-filled" aria-hidden="true" /> Featured
              </span>
            )}
            {tagsList.length > 0 && (
              <span className="category-label" style={{ margin: 0 }}>{tagsList.join(" · ")}</span>
            )}
          </div>
          <div className="featured-poem-card__read-time">
            {readTime} min read
          </div>
        </div>

        {/* Title */}
        <h2 className="featured-poem-card__title serif">{poem.title}</h2>

        {/* Excerpt */}
        <div
          className="featured-poem-card__excerpt poem-excerpt"
          dangerouslySetInnerHTML={{ __html: poem.excerpt.replace(/\n/g, "<br>") }}
        />

        {/* Footer */}
        <div className="featured-poem-card__footer">
          <Link
            href={`/author/${poem.authorId}`}
            className="featured-poem-card__author"
            onClick={e => e.stopPropagation()}
          >
            {author.image ? (
              <img src={author.image} alt={author.name} className="avatar avatar-sm" style={{ objectFit: "cover" }} />
            ) : (
              <div className="avatar avatar-sm avatar-warm">{initials}</div>
            )}
            <div>
              <div className="author-name">
                {isMine ? (<><i className="ti ti-pencil" style={{ fontSize: "11px", marginRight: "4px", opacity: 0.7 }} aria-hidden="true" />You</>) : author.name}
              </div>
              <div className="featured-poem-card__date">
                <span suppressHydrationWarning>
                  {poem.createdAt
                    ? new Date(poem.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' })
                    : 'Recently'}
                </span>
              </div>
            </div>
          </Link>

          <div className="action-icons">
            <button
              className={`action-icon ${liked ? "liked" : ""}`}
              onClick={handleLike}
              aria-label="Like"
            >
              <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} aria-hidden="true" />
              <span className="like-count" style={{ marginLeft: "4px" }}>{likeCount}</span>
            </button>
            <Link
              href={`/export/${poem.id}`}
              className="action-icon"
              onClick={e => e.stopPropagation()}
              aria-label="Download"
            >
              <i className="ti ti-download" aria-hidden="true" />
            </Link>
            <button className="action-icon" onClick={handleShare} aria-label="Share">
              <i className="ti ti-share" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
