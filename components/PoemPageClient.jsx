"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toggleLike } from "@/app/actions/interactions"
import { togglePoemInCollection } from "@/app/actions/collections"
import { createComment, getCommentsForPoem, deleteComment } from "@/app/actions/comments"
import { toggleFeatured } from "@/app/actions/poems"
import AuthorCard from "@/components/AuthorCard"
import ReportButton from "@/components/ReportButton"

export default function PoemPageClient({ poem, initialLiked = false, initialFollowingAuthor = false, userCollections = [], userId = null }) {
  const router = useRouter()
  const author = poem.author
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
  const [isPending, startTransition] = useTransition()
  const [toastMessage, setToastMessage] = useState("")
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false)
  const [localCollections, setLocalCollections] = useState(userCollections)
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState("")
  const [commentPending, setCommentPending] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const collectionsDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (collectionsDropdownRef.current && !collectionsDropdownRef.current.contains(event.target)) {
        setCollectionsModalOpen(false)
      }
    }
    
    if (collectionsModalOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [collectionsModalOpen])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage("")
    }, 2500)
  }

  const handleLike = () => {
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    
    startTransition(async () => {
      await toggleLike(poem.id)
    })
  }

  const handleToggleCollection = (collectionId, currentlyHas) => {
    setLocalCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, hasPoem: !currentlyHas } : c
    ))
    
    startTransition(async () => {
      try {
        await togglePoemInCollection(collectionId, poem.id)
        showToast(currentlyHas ? "Removed from collection" : "Saved to collection")
      } catch (e) {
        showToast("Error updating collection")
      }
    })
  }

  const handleShare = () => {
    const url = `${window.location.origin}/poem/${poem.id}`
    navigator.clipboard.writeText(url).then(() => showToast("Link copied!"))
  }

  const fetchComments = async () => {
    const result = await getCommentsForPoem(poem.id)
    if (result.success) {
      setComments(result.comments)
    } else {
      showToast("Failed to load comments")
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentInput.trim() || !userId) return
    
    setCommentPending(true)
    const result = await createComment(poem.id, commentInput)
    if (result.success) {
      setCommentInput("")
      fetchComments()
      showToast("Comment posted!")
    } else {
      showToast(result.error || "Failed to post comment")
    }
    setCommentPending(false)
  }

  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId)
    const result = await deleteComment(commentId)
    if (result.success) {
      fetchComments()
      showToast("Comment deleted")
    } else {
      showToast(result.error || "Failed to delete comment")
    }
    setDeletingCommentId(null)
  }

  useEffect(() => {
    fetchComments()
  }, [poem.id])

  const tagsList = poem.tags ? poem.tags.map(t => t.name) : []

  return (
    <div className="poem-layout">
      {/* Main poem */}
      <div className="poem-main">
        <div style={{ marginBottom: "24px" }}>
          <button className="poem-viewer-back" onClick={() => router.back()}>
            <i className="ti ti-arrow-left" style={{ fontSize: "18px" }} aria-hidden="true"></i>
            <span>Back</span>
          </button>
        </div>

        <div className="tag-row" style={{ marginBottom: "16px" }}>
          {tagsList.map(t => (
            <Link key={t} href={`/search?q=${encodeURIComponent(t.trim())}`} style={{ textDecoration: "none" }}>
              <span className="tag">{t.trim()}</span>
            </Link>
          ))}
        </div>
        <h1 className="poem-viewer-title serif">{poem.title}</h1>
        <div className="poem-viewer-meta">{author.name} · published <span suppressHydrationWarning>{poem.createdAt ? new Date(poem.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'Recently'}</span></div>

        <div className="poem-body">
          <div className="poem-viewer-text" dangerouslySetInnerHTML={{ __html: poem.fullText.replace(/\n/g, "<br>") }} />
        </div>

        {/* Poem footer */}
        <div className="poem-footer" style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <button className={`action-icon ${liked ? "liked" : ""}`} onClick={handleLike} style={{ fontSize: "14px" }}>
            <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: "20px" }} aria-hidden="true"></i>
            <span className="like-count" style={{ marginLeft: "4px" }}>{likeCount}</span> likes
          </button>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", position: "relative" }} ref={collectionsDropdownRef}>
            {userId === author.id && (
              <>
                <Link href={`/edit/${poem.id}`} className="btn btn-ghost btn-sm">
                  <i className="ti ti-edit" style={{ fontSize: "14px" }} aria-hidden="true"></i> Edit
                </Link>
                <button className={`btn btn-ghost btn-sm ${poem.featured ? "text-primary" : ""}`} onClick={() => {
                  startTransition(async () => {
                    await toggleFeatured(poem.id)
                    showToast(poem.featured ? "Unfeatured poem" : "Featured poem")
                  })
                }}>
                  <i className={`ti ${poem.featured ? "ti-star-filled" : "ti-star"}`} style={{ fontSize: "14px", color: poem.featured ? "var(--primary)" : "inherit" }} aria-hidden="true"></i> Feature
                </button>
              </>
            )}
            <button className="btn btn-ghost btn-sm" onClick={() => setCollectionsModalOpen(!collectionsModalOpen)}>
              <i className="ti ti-bookmark" style={{ fontSize: "14px" }} aria-hidden="true"></i> Save
            </button>
            <button className="btn btn-ghost btn-sm" onClick={handleShare}>
              <i className="ti ti-share" style={{ fontSize: "14px" }} aria-hidden="true"></i> Share
            </button>
            <Link href={`/export/${poem.id}`} className="btn btn-primary btn-sm">
              <i className="ti ti-download" style={{ fontSize: "14px" }} aria-hidden="true"></i> Download
            </Link>
            <ReportButton type="POEM" targetId={poem.id} buttonStyle="ghost" />

            {collectionsModalOpen && (
              <div style={{
                position: "absolute", top: "100%", right: "0", marginTop: "8px",
                backgroundColor: "var(--bg-card)", border: "1px solid var(--border-secondary)",
                borderRadius: "8px", padding: "16px", minWidth: "250px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 100
              }}>
                <h4 style={{ marginBottom: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>Save to Collection</h4>
                {localCollections.length === 0 ? (
                  <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>
                    You don't have any collections yet. <br />
                    <Link href="/collections/create" style={{ color: "var(--primary)", textDecoration: "none" }}>Create one here</Link>.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {localCollections.map(c => (
                      <label key={c.id} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                        <input 
                          type="checkbox" 
                          checked={c.hasPoem} 
                          onChange={() => handleToggleCollection(c.id, c.hasPoem)}
                        />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="poem-side">
        {/* We reuse AuthorCard, but note that AuthorCard also expects author.poems and author.readers count if available */}
        <AuthorCard author={author} initialFollowing={initialFollowingAuthor} />

        <hr className="divider" style={{ marginBottom: "20px" }} />

        {/* Download formats */}
        <div className="section-title">Download as</div>
        <div className="download-options">
          {[
            { id: "siteview", title: "Site view", desc: "As seen on Verse, with your theme" },
            { id: "minimal", title: "Minimal poster", desc: "Clean white, typography only" },
            { id: "dark", title: "Dark cinematic", desc: "Deep navy, serif layout" },
            { id: "love", title: "Love letter", desc: "Cream + floral illustration" },
            { id: "story", title: "Instagram story", desc: "9:16 vertical format" },
          ].map(opt => (
            <Link key={opt.id} href={`/export/${poem.id}?template=${opt.id}`} className="download-option">
              <div>
                <div className="download-option-title">{opt.title}</div>
                <div className="download-option-desc">{opt.desc}</div>
              </div>
              <i className="ti ti-download" style={{ fontSize: "16px", color: "var(--text-tertiary)" }} aria-hidden="true"></i>
            </Link>
          ))}
        </div>

        <hr className="divider" style={{ margin: "20px 0" }} />
        <div className="section-title">Share</div>
        <div className="share-buttons">
          <button className="btn btn-ghost btn-sm" onClick={handleShare} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <i className="ti ti-copy" style={{ fontSize: "13px" }} aria-hidden="true"></i> Copy link
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => showToast("Open Instagram and paste your poem image!")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <i className="ti ti-brand-instagram" style={{ fontSize: "13px" }} aria-hidden="true"></i> Instagram
          </button>
        </div>

        {/* Comments Section */}
        <hr className="divider" style={{ margin: "24px 0" }} />
        <div className="section-title">Comments ({comments.length})</div>
        
        {userId ? (
          <form onSubmit={handleCommentSubmit} style={{ display: "flex", gap: "12px", marginBottom: "24px", flexDirection: "column" }}>
            <textarea
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="input"
              rows={3}
              style={{ resize: "none" }}
              disabled={commentPending}
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button 
                type="submit" 
                className="btn btn-primary btn-sm" 
                disabled={commentPending || !commentInput.trim()}
              >
                {commentPending ? "Posting..." : "Post comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="empty-state" style={{ padding: "24px", border: "1px solid var(--border-secondary)", borderRadius: "12px", marginBottom: "24px" }}>
            <p style={{ marginBottom: "12px" }}>Sign in to join the conversation.</p>
            <Link href="/login" className="btn btn-primary btn-sm">Sign in</Link>
          </div>
        )}

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="empty-state" style={{ padding: "32px 16px" }}>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment-card card card-compact" style={{ marginBottom: "12px", padding: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  {comment.author.image ? (
                    <img 
                      src={comment.author.image} 
                      alt="" 
                      className="avatar avatar-md"
                      style={{ objectFit: "cover" }}
                    />
                  ) : (
                    <div className="avatar avatar-md avatar-warm">
                      {comment.author.name ? comment.author.name.match(/\b\w/g)?.join('').substring(0, 2).toUpperCase() : '?'}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "baseline", marginBottom: "6px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginRight: "8px" }}>{comment.author.name}</span>
                      <span className="stat" style={{ fontSize: "11px" }}>
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0, whiteSpace: "pre-wrap" }}>{comment.content}</p>
                    {comment.authorId === userId && (
                      <div style={{ marginTop: "8px" }}>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: "4px 8px", fontSize: "11px", color: "var(--danger)", borderColor: "transparent", background: "none" }}
                          disabled={deletingCommentId === comment.id}
                        >
                          {deletingCommentId === comment.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {toastMessage && (
        <div style={{ 
          position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", 
          backgroundColor: "var(--bg-card)", color: "var(--text-primary)", 
          padding: "12px 24px", borderRadius: "100px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          zIndex: 9999, fontSize: "14px", fontWeight: 500, border: "1px solid var(--border-secondary)",
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
        }}>
          {toastMessage}
        </div>
      )}
    </div>
  )
}
