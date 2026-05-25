"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toggleFollow, toggleLike } from "@/app/actions/interactions"

export default function AuthorPageClient({ author, poems, initialFollowing = false, initialLikedPoemIds = [] }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [activeTab, setActiveTab] = useState("all")
  const [isPending, startTransition] = useTransition()

  const likedSet = new Set(initialLikedPoemIds)

  const authorTags = [...new Set(poems.flatMap(p => p.tags ? p.tags.map(t => t.name) : []))]

  const filteredPoems = activeTab === "all" 
    ? poems 
    : poems.filter(p => p.tags && p.tags.map(t => t.name).includes(activeTab))

  const handleFollow = () => {
    setFollowing(!following)
    startTransition(async () => {
      await toggleFollow(author.id)
    })
  }

  const WorkCard = ({ poem }) => {
    const [liked, setLiked] = useState(likedSet.has(poem.id))
    const [likeCount, setLikeCount] = useState(poem._count?.likes || 0)
    const [isPendingLike, startTransitionLike] = useTransition()

    const handleLike = (e) => {
      e.preventDefault()
      e.stopPropagation()
      
      const newLiked = !liked
      setLiked(newLiked)
      setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
      
      startTransitionLike(async () => {
        await toggleLike(poem.id)
      })
    }

    const tagsList = poem.tags ? poem.tags.map(t => t.name) : []

    return (
      <Link href={`/poem/${poem.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
        <div className="card card-clickable work-card">
          <div className="work-card-category">{tagsList[0] || ""}</div>
          <div className="work-card-title">{poem.title}</div>
          <div className="work-card-excerpt" dangerouslySetInnerHTML={{ __html: poem.excerpt.replace(/\n/g, "<br>") }} />
          <div className="work-card-meta">
            <span suppressHydrationWarning>{poem.createdAt ? new Date(poem.createdAt).toLocaleDateString('en-US', { timeZone: 'UTC' }) : 'Recently'}</span> ·
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
        {author.image ? (
          <img src={author.image} alt={author.name} className="avatar avatar-xl" style={{ objectFit: "cover" }} />
        ) : (
          <div className="avatar avatar-xl avatar-warm">{author.initials}</div>
        )}
        <div style={{ flex: 1 }}>
          <h1 className="profile-name">{author.name}</h1>
          <p className="profile-bio">{author.bio} · {author.location}</p>
          <div className="profile-stats">
            <span className="stat"><strong>{author.poemsCount}</strong> poems</span>
            <span className="stat"><strong>{author.readersCount}</strong> readers</span>
            <span className="stat"><strong>0</strong> reading</span>
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
