"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toggleFollow, toggleLike } from "@/app/actions/interactions"
import PoemCard from "@/components/PoemCard"
import ReportButton from "@/components/ReportButton"
import Avatar from "@/components/Avatar"

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



  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Profile hero */}
      <div className="profile-hero">
        <Avatar image={author.image} name={author.name} size="xl" />
        <div style={{ flex: 1 }}>
          <h1 className="profile-name">{author.name}</h1>
          <p className="profile-bio">{author.bio} · {author.location}</p>
          <div className="profile-stats">
            <span className="stat" style={{ cursor: "pointer" }} onClick={() => setActiveTab("all")}><strong>{author.poemsCount}</strong> poems</span>
            <span className="stat" style={{ cursor: "pointer" }} onClick={() => setActiveTab("followers")}><strong>{author.readersCount}</strong> followers</span>
            <span className="stat" style={{ cursor: "pointer" }} onClick={() => setActiveTab("following")}><strong>{author.followingCount}</strong> following</span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "12px" }}>
            <button
              data-testid="follow-button"
              className={`btn ${following ? "btn-primary" : "btn-ghost"}`}
              onClick={handleFollow}
              style={{ fontSize: "12px", padding: "7px 20px" }}
            >
              {following ? "Following" : "Follow"}
            </button>
            <ReportButton type="USER" targetId={author.id} buttonStyle="ghost" />
          </div>
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
        <button
          className={`tab-item ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => setActiveTab("followers")}
        >
          Followers
        </button>
        <button
          className={`tab-item ${activeTab === "following" ? "active" : ""}`}
          onClick={() => setActiveTab("following")}
        >
          Following
        </button>
      </div>

      {/* Content area */}
      <div style={{ padding: "24px" }}>
        {activeTab === "followers" || activeTab === "following" ? (
          <div className="user-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(() => {
              const list = activeTab === "followers" ? author.followersList : author.followingList
              if (!list || list.length === 0) {
                return (
                  <div className="empty-state">
                    <i className="ti ti-users" aria-hidden="true"></i>
                    <p>No {activeTab} yet</p>
                  </div>
                )
              }
              return list.map(user => (
                <Link key={user.id} href={`/author/${user.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card card-compact" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <Avatar image={user.image} name={user.name} size="md" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{user.name}</div>
                      {user.bio && <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{user.bio}</div>}
                    </div>
                    <i className="ti ti-chevron-right" style={{ color: "var(--text-tertiary)" }}></i>
                  </div>
                </Link>
              ))
            })()}
          </div>
        ) : (
          <div className="profile-works-grid" style={{ transition: "opacity 0.3s ease" }}>
            {filteredPoems.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <i className="ti ti-feather" aria-hidden="true"></i>
                <p>No {activeTab !== "all" ? activeTab : ""} poems yet</p>
              </div>
            ) : (
              filteredPoems.map(poem => {
                const p = { ...poem, author }
                return <PoemCard key={p.id} poem={p} initialLiked={likedSet.has(p.id)} hideAuthor={true} />
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
