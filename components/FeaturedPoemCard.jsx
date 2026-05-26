"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleLike } from "@/app/actions/interactions"
import Avatar from "./Avatar"

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
  const [copied, setCopied] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  const shareMenuRef = useRef(null)
  const readTime = estimateReadTime(poem.fullText || poem.excerpt)

  const handleLike = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    startTransition(async () => { await toggleLike(poem.id) })
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/poem/${poem.id}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setShareMenuOpen(false)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleShareMenuToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShareMenuOpen(prev => !prev)
  }

  // Close share menu on outside click
  useEffect(() => {
    if (!shareMenuOpen) return
    const onOutside = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        e.stopPropagation()
        e.preventDefault()
        setShareMenuOpen(false)
      }
    }
    document.addEventListener("click", onOutside, true)
    return () => document.removeEventListener("click", onOutside, true)
  }, [shareMenuOpen])

  if (!author) return null

  const allTags = poem.tags ? poem.tags.map(t => t.name) : []
  // Show at most 3 tags; truncate each to 18 chars
  const MAX_TAGS = 3
  const MAX_TAG_LEN = 18
  const tagsList = allTags.slice(0, MAX_TAGS)
  const hiddenTagCount = allTags.length - tagsList.length

  const initials = author.name
    ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?'

  return (
    <article
      className={`featured-poem-card${isMine ? " poem-card--mine" : ""}`}
      onClick={() => router.push(`/poem/${poem.id}`)}
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
              <span className="category-label" style={{ margin: 0 }}>
                {tagsList.map((t, i) => (
                  <span key={t}>
                    <span title={t.length > MAX_TAG_LEN ? t : undefined}>
                      #{t.length > MAX_TAG_LEN ? t.slice(0, MAX_TAG_LEN) + "…" : t}
                    </span>
                    {i < tagsList.length - 1 && " · "}
                  </span>
                ))}
                {hiddenTagCount > 0 && (
                  <span style={{ opacity: 0.55, fontSize: "12px", marginLeft: "4px" }}>+{hiddenTagCount}</span>
                )}
              </span>
            )}
          </div>
          <div className="featured-poem-card__read-time">
            {readTime} m read
          </div>
        </div>

        {/* Title */}
        <h2 className="featured-poem-card__title serif poem-card__title--clamp-2" title={poem.title}>{poem.title}</h2>

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
            <Avatar image={author.image} name={author.name} size="sm" />
            <div>
              <div className="author-name">
                {isMine ? (<><i className="ti ti-pencil" style={{ fontSize: "11px", marginRight: "4px", opacity: 0.7 }} aria-hidden="true" />{author.name} (You)</>) : author.name}
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

            {/* Download — hidden on very small screens, shown via share menu */}
            <Link
              href={`/export/${poem.id}`}
              className="action-icon poem-card-download-btn"
              onClick={e => e.stopPropagation()}
              aria-label="Download"
            >
              <i className="ti ti-download" aria-hidden="true" />
            </Link>

            {/* Share — hidden on very small screens */}
            <button className="action-icon poem-card-share-btn" onClick={handleShare} aria-label="Share">
              <i className={`ti ${copied ? "ti-check" : "ti-share"}`} style={{ color: copied ? "var(--primary)" : "inherit" }} aria-hidden="true" />
            </button>

            {/* Combined share menu trigger — visible only on very small screens */}
            <div className="poem-card-share-menu-wrap" ref={shareMenuRef}>
              <button
                className={`action-icon poem-card-share-menu-btn ${copied ? "liked" : ""}`}
                onClick={handleShareMenuToggle}
                aria-label="Share options"
                aria-expanded={shareMenuOpen}
                aria-haspopup="true"
              >
                <i className={`ti ${copied ? "ti-check" : "ti-share"}`} style={{ color: copied ? "var(--primary)" : "inherit" }} aria-hidden="true" />
              </button>
              {shareMenuOpen && (
                <div className="poem-card-share-dropdown" role="menu">
                  <Link
                    href={`/export/${poem.id}`}
                    className="poem-card-share-dropdown-item"
                    onClick={e => { e.stopPropagation(); setShareMenuOpen(false) }}
                    role="menuitem"
                  >
                    <i className="ti ti-download" aria-hidden="true" />
                    Download
                  </Link>
                  <button
                    className="poem-card-share-dropdown-item"
                    onClick={handleShare}
                    role="menuitem"
                  >
                    <i className="ti ti-share" aria-hidden="true" />
                    Share link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
