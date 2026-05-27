"use client"

import { useState, useTransition, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toggleLike } from "@/app/actions/interactions"
import Avatar from "./Avatar"
import ExportModal from "./ExportModal"
import AtmosphericVibe from "./AtmosphericVibe"

import styles from "./PoemCard.module.css"
import Card from "./Card"
import Badge from "./Badge"

function estimateReadTime(text) {
  if (!text) return 1
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return minutes < 1 ? 1 : minutes
}

export default function PoemCard({ poem, initialLiked = false, onRemove = null, customRemoveButton = null, isMine = false, hideAuthor = false, isImmersive = false }) {
  const router = useRouter()
  // poem.author is included from Prisma query
  const author = poem.author

  const [copied, setCopied] = useState(false)
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
  const [isPending, startTransition] = useTransition()

  const shareMenuRef = useRef(null)
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
    } catch (err) { }
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

  // compute initials
  const initials = author.name ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'

  return (
    <div onClick={() => router.push(`/poem/${poem.id}`)} style={{ cursor: "pointer", display: "block", position: "relative" }} className={`${styles['poem-card-container']} ${isImmersive ? styles['immersive-card-wrapper'] : ''}`} data-testid="poem-card-container">
      {customRemoveButton}
      <Card
        as="article"
        clickable
        className={`${styles['poem-card-featured']} ${isMine ? styles['poem-card--mine'] : ""} ${isImmersive ? styles['immersive-card'] : ""}`}
        data-testid="poem-card"
        style={{ marginBottom: "16px" }}
        aria-label={`Poem: ${poem.title}`}
      >
        {poem.featured && <Badge variant="featured">featured</Badge>}
        <div className="category-label" style={{ marginBottom: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {tagsList.map((t, i) => (
            <span key={t}>
              <Link
                href={`/search?q=${encodeURIComponent(t)}`}
                onClick={e => e.stopPropagation()}
                style={{ color: "inherit", textDecoration: "none" }}
                title={t.length > MAX_TAG_LEN ? t : undefined}
              >
                #{t.length > MAX_TAG_LEN ? t.slice(0, MAX_TAG_LEN) + "…" : t}
              </Link>
              {i < tagsList.length - 1 && " · "}
            </span>
          ))}
          {hiddenTagCount > 0 && (
            <span style={{ opacity: 0.55, fontSize: "12px" }}>+{hiddenTagCount}</span>
          )}
        </div>
        <h2 className={`serif ${styles['poem-card__title--clamp']} poem-card__title--clamp`} style={{ fontSize: "22px", marginBottom: "12px", letterSpacing: "-0.3px" }} title={poem.title}>{poem.title}</h2>
        <div className={`${styles['poem-excerpt']} poem-excerpt ${isImmersive ? styles['immersive-excerpt'] : ''}`} style={isImmersive ? { fontSize: "15px", flexShrink: 0 } : { fontSize: "15px" }} dangerouslySetInnerHTML={{ __html: ((isImmersive && poem.fullText) ? poem.fullText : poem.excerpt).replace(/\n/g, "<br>") }} />
        
        {isImmersive && <AtmosphericVibe poem={poem} config={poem.vibeConfig} />}

        <div className={`${styles['card-footer']} card-footer`} style={isImmersive ? { marginTop: 0 } : {}}>
          <div className={styles['author-info']}>
            {hideAuthor ? (
              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>
                {readTime} m read
              </div>
            ) : (
              <Link href={`/author/${poem.authorId}`} className={styles['author-info']} style={{ textDecoration: "none", color: "inherit" }} onClick={e => e.stopPropagation()}>
                <Avatar image={author.image} name={author.name} size="sm" />
                <div>
                  <div className={styles['author-name']}>
                    {isMine ? (<><i className="ti ti-pencil" style={{ fontSize: "11px", marginRight: "4px", opacity: 0.7 }} aria-hidden="true" />{author.name} (You)</>) : author.name}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                    {readTime} m read
                  </div>
                </div>
              </Link>
            )}
          </div>

          <div className="action-icons">
            <button className={`action-icon ${liked ? "liked" : ""}`} onClick={handleLike} aria-label="Like">
              <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: "16px" }} aria-hidden="true"></i>
              <span className="like-count" style={{ marginLeft: "4px" }}>{likeCount}</span>
            </button>

            <button className={`action-icon`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} aria-label="Repost">
              <i className="ti ti-repeat" style={{ fontSize: "16px" }} aria-hidden="true"></i>
              <span className="like-count" style={{ marginLeft: "4px" }}>0</span>
            </button>

            {/* Combined share menu trigger */}
            <div className={`${styles['poem-card-share-menu-wrap']} poem-card-share-menu-wrap`} ref={shareMenuRef}>
              <button
                className={`action-icon ${styles['poem-card-share-menu-btn']} poem-card-share-menu-btn ${copied ? "liked" : ""}`}
                onClick={handleShareMenuToggle}
                aria-label="Share options"
                aria-expanded={shareMenuOpen}
                aria-haspopup="true"
              >
                <i className={`ti ${copied ? "ti-check" : "ti-share"}`} style={{ fontSize: "16px", color: copied ? "var(--primary)" : "inherit" }} aria-hidden="true"></i>
              </button>
              {shareMenuOpen && (
                <div className={`${styles['poem-card-share-dropdown']} poem-card-share-dropdown`} role="menu">
                  <button
                    className={`${styles['poem-card-share-dropdown-item']} poem-card-share-dropdown-item`}
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setShareMenuOpen(false); setExportModalOpen(true) }}
                    role="menuitem"
                  >
                    <i className="ti ti-download" aria-hidden="true" />
                    Download
                  </button>
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
      </Card>
      {exportModalOpen && (
        <ExportModal
          poem={poem}
          author={author}
          onClose={() => setExportModalOpen(false)}
        />
      )}
    </div>
  )
}
