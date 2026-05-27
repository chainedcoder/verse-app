"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toggleLike, getLikers } from "@/app/actions/interactions"
import { togglePoemInCollection } from "@/app/actions/collections"
import { createComment, getCommentsForPoem, deleteComment } from "@/app/actions/comments"
import { toggleFeatured } from "@/app/actions/poems"
import AuthorCard from "@/components/AuthorCard"
import ReportButton from "@/components/ReportButton"
import Avatar from "@/components/Avatar"

export default function PoemPageClient({ poem, initialLiked = false, initialFollowingAuthor = false, userCollections = [], userId = null }) {
  const router = useRouter()
  const author = poem.author
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
  const [isPending, startTransition] = useTransition()
  const [toastMessage, setToastMessage] = useState("")
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false)
  const [embedModalOpen, setEmbedModalOpen] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)
  const [localCollections, setLocalCollections] = useState(userCollections)
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState("")
  const [commentPending, setCommentPending] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [likersModalOpen, setLikersModalOpen] = useState(false)
  const [likers, setLikers] = useState([])
  const [likersLoading, setLikersLoading] = useState(false)
  const [shareUrls, setShareUrls] = useState({ twitter: "", facebook: "" })
  const collectionsDropdownRef = useRef(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/poem/${poem.id}`
      const text = `"${poem.title}" by ${poem.author.name} on Verse`
      Promise.resolve().then(() => setShareUrls({
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      }))
    }
  }, [poem.id, poem.title, poem.author.name])

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

  const handleOpenLikers = async () => {
    setLikersModalOpen(true)
    setLikersLoading(true)
    const result = await getLikers(poem.id)
    if (result.success) {
      setLikers(result.likers)
    } else {
      showToast("Failed to load likers")
    }
    setLikersLoading(false)
  }

  const handleToggleCollection = (collectionId, currentlyHas) => {
    setLocalCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, hasPoem: !currentlyHas } : c
    ))
    
    startTransition(async () => {
      try {
        showToast(currentlyHas ? "Removed from collection" : "Saved to collection")
        await togglePoemInCollection(collectionId, poem.id)
      } catch (e) {
        showToast("Error updating collection")
      }
    })
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/poem/${poem.id}`
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: poem.title,
          text: poem.excerpt?.replace(/<[^>]+>/g, "").slice(0, 120) + "…",
          url,
        })
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    navigator.clipboard.writeText(url)
      .then(() => showToast("Link copied!"))
      .catch((err) => {
        console.warn("Failed to copy link: ", err)
      })
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
    Promise.resolve().then(() => fetchComments())
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className={`action-icon ${liked ? "liked" : ""}`} onClick={handleLike} style={{ fontSize: "14px", display: "flex", alignItems: "center" }}>
              <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: "20px" }} aria-hidden="true"></i>
            </button>
            <button onClick={handleOpenLikers} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--text-secondary)", padding: 0 }}>
              <span className="like-count" style={{ fontWeight: "500" }}>{likeCount}</span> likes
            </button>
          </div>
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
            <button className="btn btn-ghost btn-sm" onClick={handleShare} aria-label="Share poem">
              <i className="ti ti-share" style={{ fontSize: "14px" }} aria-hidden="true"></i> Share
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setEmbedModalOpen(true)} aria-label="Get embed code">
              <i className="ti ti-code" style={{ fontSize: "14px" }} aria-hidden="true"></i> Embed
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
        <div className="share-buttons" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px" }}>
          <button className="btn btn-ghost btn-sm" onClick={handleShare} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", width: "100%" }}>
            <i className="ti ti-copy" style={{ fontSize: "13px" }} aria-hidden="true"></i> Copy Link
          </button>
          <a href={shareUrls.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", textDecoration: "none", color: "inherit", width: "100%" }} aria-label="Share on Twitter/X">
            <i className="ti ti-brand-x" style={{ fontSize: "13px" }} aria-hidden="true"></i> Twitter/X
          </a>
          <a href={shareUrls.facebook} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", textDecoration: "none", color: "inherit", width: "100%" }} aria-label="Share on Facebook">
            <i className="ti ti-brand-facebook" style={{ fontSize: "13px" }} aria-hidden="true"></i> Facebook
          </a>
          <button className="btn btn-ghost btn-sm" onClick={() => showToast("Open Instagram and paste your poem image!")} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", width: "100%" }}>
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
                  <Avatar image={comment.author.image} name={comment.author.name} size="md" />
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
        <div role="alert" aria-live="polite" style={{ 
          position: "fixed", bottom: "30px", left: "50%", transform: "translateX(-50%)", 
          backgroundColor: "var(--bg-card)", color: "var(--text-primary)", 
          padding: "12px 24px", borderRadius: "100px", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          zIndex: 9999, fontSize: "14px", fontWeight: 500, border: "1px solid var(--border-secondary)",
          transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out"
        }}>
          {toastMessage}
        </div>
      )}

      {likersModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "20px"
        }} onClick={(e) => {
          if (e.target === e.currentTarget) setLikersModalOpen(false)
        }}>
          <div style={{
            backgroundColor: "var(--bg-card)", borderRadius: "12px", width: "100%", maxWidth: "400px",
            maxHeight: "80vh", display: "flex", flexDirection: "column", border: "1px solid var(--border-secondary)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Likes</h3>
              <button onClick={() => setLikersModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "20px" }}>
                <i className="ti ti-x" aria-hidden="true"></i>
              </button>
            </div>
            <div style={{ padding: "0 20px", overflowY: "auto", flex: 1 }}>
              {likersLoading ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)" }}>Loading...</div>
              ) : likers.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "var(--text-tertiary)" }}>No likes yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {likers.map(user => (
                    <Link key={user.id} href={`/author/${user.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 0", borderBottom: "1px solid var(--border-secondary)", textDecoration: "none", color: "inherit" }}>
                      <Avatar image={user.image} name={user.name} size="md" />
                      <div>
                        <div style={{ fontWeight: "500", fontSize: "14px" }}>{user.name}</div>
                        {user.bio && <div style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "250px" }}>{user.bio}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Embed Modal */}
      {embedModalOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
            alignItems: "center", justifyContent: "center",
            zIndex: 9999, padding: "20px"
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setEmbedModalOpen(false) }}
          role="dialog"
          aria-modal="true"
          aria-label="Embed code"
        >
          <div style={{
            backgroundColor: "var(--bg-card)", borderRadius: "12px", width: "100%",
            maxWidth: "520px", border: "1px solid var(--border-secondary)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)", overflow: "hidden"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Embed this poem</h3>
              <button onClick={() => setEmbedModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", fontSize: "20px" }} aria-label="Close">
                <i className="ti ti-x" aria-hidden="true"></i>
              </button>
            </div>
            <div style={{ padding: "20px" }}>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px", lineHeight: 1.5 }}>
                Copy the code below to embed this poem on any website.
              </p>
              <div style={{ position: "relative", marginBottom: "16px" }}>
                <textarea
                  readOnly
                  data-testid="embed-code"
                  value={`<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/poem/${poem.id}/embed" width="100%" height="400" style="border:none;border-radius:12px;" loading="lazy" title="${poem.title} by ${poem.author?.name} on Verse"></iframe>`}
                  className="input"
                  rows={4}
                  style={{ resize: "none", fontSize: "12px", fontFamily: "monospace", paddingRight: "44px" }}
                  onClick={(e) => e.target.select()}
                />
              </div>
              <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", alignItems: "center" }}>
                <a
                  href={`/poem/${poem.id}/embed`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  <i className="ti ti-external-link" style={{ fontSize: "14px" }} aria-hidden="true" /> Preview
                </a>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const url = typeof window !== 'undefined' ? window.location.origin : ''
                    const code = `<iframe src="${url}/poem/${poem.id}/embed" width="100%" height="400" style="border:none;border-radius:12px;" loading="lazy" title="${poem.title} by ${poem.author?.name} on Verse"></iframe>`
                    navigator.clipboard.writeText(code).then(() => {
                      setEmbedCopied(true)
                      setTimeout(() => setEmbedCopied(false), 2000)
                    })
                  }}
                >
                  <i className={`ti ${embedCopied ? 'ti-check' : 'ti-copy'}`} style={{ fontSize: "14px" }} aria-hidden="true" />
                  {embedCopied ? 'Copied!' : 'Copy code'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
