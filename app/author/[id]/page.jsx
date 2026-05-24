"use client"

import { useState, use } from "react"
import Link from "next/link"
import { getAuthor, getPoemsByAuthor, isFollowing, toggleFollow, isLiked, getLikeCount, toggleLike } from "@/lib/data"

export default function AuthorPage(props) {
  const params = use(props.params)
  const authorId = params.id
  const author = getAuthor(authorId)

  if (!author) {
    return (
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <i className="ti ti-user-off" style={{ fontSize: "48px", color: "var(--text-tertiary)", marginBottom: "16px", display: "block" }}></i>
        <h2 style={{ marginBottom: "8px" }}>Author not found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>The author you're looking for doesn't exist.</p>
        <Link href="/" className="btn btn-primary">Back to feed</Link>
      </div>
    )
  }

  const poems = getPoemsByAuthor(authorId)
  const [following, setFollowing] = useState(isFollowing(authorId))
  const [activeTab, setActiveTab] = useState("all")

  const authorTags = [...new Set(poems.flatMap(p => p.tags))]

  const filteredPoems = activeTab === "all" 
    ? poems 
    : poems.filter(p => p.tags.includes(activeTab))

  const handleFollow = () => {
    setFollowing(toggleFollow(authorId))
  }

  const WorkCard = ({ poem }) => {
    const [liked, setLiked] = useState(isLiked(poem.id))
    const [likeCount, setLikeCount] = useState(getLikeCount(poem.id))

    const handleLike = (e) => {
      e.preventDefault()
      e.stopPropagation()
      setLiked(toggleLike(poem.id))
      setLikeCount(getLikeCount(poem.id))
    }

    return (
      <Link href={`/poem/${poem.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="card card-clickable work-card">
          <div className="work-card-category">{poem.tags[0] || ""}</div>
          <div className="work-card-title">{poem.title}</div>
          <div className="work-card-excerpt">{poem.excerpt}</div>
          <div className="work-card-meta">
            {poem.date} ·
            <button className={`action-icon ${liked ? "liked" : ""}`} onClick={handleLike} style={{ fontSize: "11px", padding: "2px", marginLeft: "4px" }}>
              <i className={`ti ${liked ? "ti-heart-filled" : "ti-heart"}`} style={{ fontSize: "13px" }} aria-hidden="true"></i>
              <span className="like-count" style={{ marginLeft: "4px" }}>{likeCount}</span>
            </button>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* Profile hero */}
      <div className="profile-hero">
        <div className={`avatar avatar-xl ${author.avatarClass}`}>{author.initials}</div>
        <div style={{ flex: 1 }}>
          <h1 className="profile-name">{author.name}</h1>
          <p className="profile-bio">{author.bio} · {author.location}</p>
          <div className="profile-stats">
            <span className="stat"><strong>{author.poems}</strong> poems</span>
            <span className="stat"><strong>{author.readers}</strong> readers</span>
            <span className="stat"><strong>{author.reading}</strong> reading</span>
          </div>
          <button 
            className={`btn ${following ? "btn-primary" : "btn-ghost"}`} 
            onClick={handleFollow} 
            style={{ fontSize: "12px", padding: "7px 20px" }}
          >
            {following ? "Following" : "Follow"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button 
          className={`tab-item ${activeTab === "all" ? "active" : ""}`} 
          onClick={() => setActiveTab("all")}
        >
          All works
        </button>
        {authorTags.map(tag => (
          <button 
            key={tag}
            className={`tab-item ${activeTab === tag ? "active" : ""}`} 
            onClick={() => setActiveTab(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Work grid */}
      <div style={{ padding: "24px" }}>
        <div className="profile-works-grid" style={{ transition: "opacity 0.3s ease" }}>
          {filteredPoems.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: "1/-1" }}>
              <i className="ti ti-feather" aria-hidden="true"></i>
              <p>No {activeTab !== "all" ? activeTab : ""} poems yet</p>
            </div>
          ) : (
            filteredPoems.map(poem => <WorkCard key={poem.id} poem={poem} />)
          )}
        </div>
      </div>
    </>
  )
}
