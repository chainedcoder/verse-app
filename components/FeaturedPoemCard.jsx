"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleLike } from "@/app/actions/interactions"
import Avatar from "./Avatar"
import Badge from "./Badge"
import styles from "./FeaturedPoemCard.module.css"

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

  const getPoemUrl = () => `${window.location.origin}/poem/${poem.id}`

  const handleCopyLink = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = getPoemUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setShareMenuOpen(false)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn("Failed to copy link: ", err)
    }
  }

  const handleShareSystem = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = getPoemUrl()
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: poem.title, url })
        setShareMenuOpen(false)
      } catch {
        // cancelled or unsupported
      }
    } else {
      handleCopyLink(e)
    }
  }

  const handleShareX = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = getPoemUrl()
    const text = encodeURIComponent(`Check out "${poem.title}"`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
    setShareMenuOpen(false)
  }

  const handleShareInstagram = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const url = getPoemUrl()
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {}
    window.open('https://instagram.com', '_blank')
    setShareMenuOpen(false)
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
      className={`${styles['featured-poem-card']} featured-poem-card ${isMine ? styles['poem-card--mine'] : ""}`}
      onClick={() => router.push(`/poem/${poem.id}`)}
      aria-label={`Featured poem: ${poem.title}`}
    >
      {/* Accent bar */}
      <div className={styles['featured-poem-card__accent']} aria-hidden="true" />

      <div className={styles['featured-poem-card__body']}>
        {/* Header row */}
        <div className={styles['featured-poem-card__header']}>
          <div className={styles['featured-poem-card__meta']}>
            {poem.featured && (
              <Badge variant="featured">
                <i className="ti ti-star-filled" aria-hidden="true" /> Featured
              </Badge>
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
          <div className={`${styles['featured-poem-card__read-time']} featured-poem-card__read-time`}>
            {readTime} m read
          </div>
        </div>

        {/* Title */}
        <h2 className={`${styles['featured-poem-card__title']} serif ${styles['poem-card__title--clamp-2']} poem-card__title--clamp-2 poem-card__title--clamp`} title={poem.title}>{poem.title}</h2>

        {/* Excerpt */}
        <div
          className={`${styles['featured-poem-card__excerpt']} poem-excerpt`}
          dangerouslySetInnerHTML={{ __html: poem.excerpt.replace(/\n/g, "<br>") }}
        />

        {/* Footer */}
        <div className={styles['featured-poem-card__footer']}>
          <Link
            href={`/author/${poem.authorId}`}
            className={styles['featured-poem-card__author']}
            onClick={e => e.stopPropagation()}
          >
            <Avatar image={author.image} name={author.name} size="sm" />
            <div>
              <div className={styles['author-name']}>
                {isMine ? (<><i className="ti ti-pencil" style={{ fontSize: "11px", marginRight: "4px", opacity: 0.7 }} aria-hidden="true" />{author.name} (You)</>) : author.name}
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

            <button className={`action-icon`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} aria-label="Repost">
              <i className="ti ti-repeat" style={{ fontSize: "16px" }} aria-hidden="true"></i>
              <span className="like-count" style={{ marginLeft: "4px" }}>0</span>
            </button>

            {/* Combined share menu trigger */}
            <div className={`poem-card-share-menu-wrap ${styles['poem-card-share-menu-wrap']}`} ref={shareMenuRef}>
              <button
                className={`action-icon ${styles['poem-card-share-menu-btn']} poem-card-share-menu-btn ${copied ? "liked" : ""}`}
                onClick={handleShareMenuToggle}
                aria-label="Share options"
                aria-expanded={shareMenuOpen}
                aria-haspopup="true"
              >
                <i className={`ti ${copied ? "ti-check" : "ti-share"}`} style={{ color: copied ? "var(--primary)" : "inherit" }} aria-hidden="true" />
              </button>
              {shareMenuOpen && (
                <div className={`${styles['poem-card-share-dropdown']} poem-card-share-dropdown`} role="menu">
                  <Link
                    href={`/export/${poem.id}`}
                    className={`${styles['poem-card-share-dropdown-item']} poem-card-share-dropdown-item`}
                    onClick={e => { e.stopPropagation(); setShareMenuOpen(false) }}
                    role="menuitem"
                  >
                    <i className="ti ti-download" aria-hidden="true" />
                    Download
                  </Link>
                  <button
                    className={`${styles['poem-card-share-dropdown-item']} poem-card-share-dropdown-item`}
                    onClick={handleShareX}
                    role="menuitem"
                  >
                    <i className="ti ti-brand-x" aria-hidden="true" />
                    Share to X
                  </button>
                  <button
                    className={`${styles['poem-card-share-dropdown-item']} poem-card-share-dropdown-item`}
                    onClick={handleShareInstagram}
                    role="menuitem"
                  >
                    <i className="ti ti-brand-instagram" aria-hidden="true" />
                    Instagram
                  </button>
                  <button
                    className={`${styles['poem-card-share-dropdown-item']} poem-card-share-dropdown-item`}
                    onClick={handleCopyLink}
                    role="menuitem"
                  >
                    <i className="ti ti-copy" aria-hidden="true" />
                    Copy link
                  </button>
                  <button
                    className={`${styles['poem-card-share-dropdown-item']} poem-card-share-dropdown-item`}
                    onClick={handleShareSystem}
                    role="menuitem"
                  >
                    <i className="ti ti-dots" aria-hidden="true" />
                    Others
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
