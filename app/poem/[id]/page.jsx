"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getPoem, getAuthor, isLiked, getLikeCount, toggleLike } from "@/lib/data"
import AuthorCard from "@/components/AuthorCard"

export default function PoemPage(props) {
  const params = use(props.params)
  const router = useRouter()
  // React hook to unwrap params
  const poemId = params.id
  const poem = getPoem(poemId)

  if (!poem) {
    return (
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <i className="ti ti-mood-sad" style={{ fontSize: "48px", color: "var(--text-tertiary)", marginBottom: "16px", display: "block" }}></i>
        <h2 style={{ marginBottom: "8px" }}>Poem not found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>The poem you're looking for doesn't exist.</p>
        <Link href="/" className="btn btn-primary">Back to feed</Link>
      </div>
    )
  }

  const author = getAuthor(poem.authorId)
  const [liked, setLiked] = useState(isLiked(poem.id))
  const [likeCount, setLikeCount] = useState(getLikeCount(poem.id))
  const [toastMessage, setToastMessage] = useState("")

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage("")
    }, 2500)
  }

  const handleLike = () => {
    setLiked(toggleLike(poem.id))
    setLikeCount(getLikeCount(poem.id))
  }

  const handleShare = () => {
    const url = `${window.location.origin}/poem/${poem.id}`
    navigator.clipboard.writeText(url).then(() => showToast("Link copied!"))
  }

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
          {poem.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
        <h1 className="poem-viewer-title serif">{poem.title}</h1>
        <div className="poem-viewer-meta">{author.name} · published {poem.date}</div>

        <div className="poem-body">
          <div className="poem-viewer-text" dangerouslySetInnerHTML={{ __html: poem.fullText.replace(/\n/g, "<br>") }} />
        </div>

        {/* Poem footer */}
        <div className="poem-footer" style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px solid var(--border-tertiary)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <button className={`action-icon ${liked ? "liked" : ""}`} onClick={handleLike} style={{ fontSize: "14px" }}>
            <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: "20px" }} aria-hidden="true"></i>
            <span className="like-count" style={{ marginLeft: "4px" }}>{likeCount}</span> likes
          </button>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="btn btn-ghost btn-sm" onClick={handleShare}>
              <i className="ti ti-share" style={{ fontSize: "14px" }} aria-hidden="true"></i> Share
            </button>
            <Link href={`/export/${poem.id}`} className="btn btn-primary btn-sm">
              <i className="ti ti-download" style={{ fontSize: "14px" }} aria-hidden="true"></i> Download
            </Link>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div className="poem-side">
        <AuthorCard author={author} />

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
