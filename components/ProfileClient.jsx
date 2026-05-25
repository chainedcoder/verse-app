"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toggleLike } from "@/app/actions/interactions"
import PoemCard from "@/components/PoemCard"

export default function ProfileClient({ user, poems, likedPoems, collections, initialLikedPoemIds = [] }) {
  const [activeTab, setActiveTab] = useState("poems")
  
  const likedSet = new Set(initialLikedPoemIds)

  // We can reuse the WorkCard logic from AuthorPageClient, or use PoemCard.
  // Since we have PoemCard already, let's use it for My Poems and Liked Poems to keep UI consistent.
  
  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      {/* Profile hero */}
      <div className="profile-hero">
        {user.image ? (
          <img src={user.image} alt={user.name} className="avatar avatar-xl" style={{ objectFit: "cover" }} />
        ) : (
          <div className="avatar avatar-xl avatar-warm">{user.initials}</div>
        )}
        <div style={{ flex: 1 }}>
          <h1 className="profile-name">{user.name}</h1>
          {user.bio && <p className="profile-bio">{user.bio} {user.location ? `· ${user.location}` : ""}</p>}
          <div className="profile-stats" style={{ marginBottom: "16px" }}>
            <span className="stat" style={{ cursor: "pointer" }} onClick={() => setActiveTab("poems")}><strong>{user.poemsCount}</strong> poems</span>
            <span className="stat" style={{ cursor: "pointer" }} onClick={() => setActiveTab("followers")}><strong>{user.readersCount}</strong> followers</span>
            <span className="stat" style={{ cursor: "pointer" }} onClick={() => setActiveTab("following")}><strong>{user.followingCount}</strong> following</span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/settings/profile" className="btn btn-ghost btn-sm">
              <i className="ti ti-edit" aria-hidden="true"></i> Edit Profile
            </Link>
            <Link href="/write" className="btn btn-primary btn-sm">
              <i className="ti ti-pencil" aria-hidden="true"></i> Write Poem
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button 
          className={`tab-item ${activeTab === "poems" ? "active" : ""}`} 
          onClick={() => setActiveTab("poems")}
        >
          My Poems
        </button>
        <button 
          className={`tab-item ${activeTab === "liked" ? "active" : ""}`} 
          onClick={() => setActiveTab("liked")}
        >
          Liked
        </button>
        <button 
          className={`tab-item ${activeTab === "collections" ? "active" : ""}`} 
          onClick={() => setActiveTab("collections")}
        >
          Collections
        </button>
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
      <div style={{ paddingTop: "24px" }}>
        {activeTab === "poems" && (
          <div className="profile-works-grid" style={{ transition: "opacity 0.3s ease" }}>
            {poems.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <i className="ti ti-feather" aria-hidden="true"></i>
                <p>You haven't written any poems yet.</p>
                <Link href="/write" className="btn btn-primary" style={{ marginTop: "16px" }}>Start writing</Link>
              </div>
            ) : (
              poems.map(poem => {
                const p = { ...poem, author: user }
                return <PoemCard key={p.id} poem={p} initialLiked={likedSet.has(p.id)} isMine={true} />
              })
            )}
          </div>
        )}

        {activeTab === "liked" && (
          <div className="profile-works-grid" style={{ transition: "opacity 0.3s ease" }}>
            {likedPoems.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <i className="ti ti-heart" aria-hidden="true"></i>
                <p>You haven't liked any poems yet.</p>
                <Link href="/" className="btn btn-primary" style={{ marginTop: "16px" }}>Discover poems</Link>
              </div>
            ) : (
              likedPoems.map(poem => (
                <PoemCard key={poem.id} poem={poem} initialLiked={true} />
              ))
            )}
          </div>
        )}

        {activeTab === "collections" && (
          <div className="collections-grid" style={{ 
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "20px" 
          }}>
            {collections.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: "1/-1" }}>
                <i className="ti ti-folders" aria-hidden="true"></i>
                <p>You haven't created any collections yet.</p>
                <Link href="/collections/create" className="btn btn-primary" style={{ marginTop: "16px" }}>Create collection</Link>
              </div>
            ) : (
              collections.map(collection => (
                <Link href={`/collections/${collection.id}`} key={collection.id} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                  <div className="card card-clickable" style={{ padding: "20px", display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>{collection.name}</h3>
                      {!collection.isPublic && (
                        <i className="ti ti-lock" style={{ fontSize: "14px", color: "var(--text-tertiary)" }} title="Private collection"></i>
                      )}
                    </div>
                    {collection.description && (
                      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", flexGrow: 1, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {collection.description}
                      </p>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", fontSize: "12px", color: "var(--text-tertiary)", fontWeight: "500" }}>
                      <span>{collection._count?.poems || 0} poem{(collection._count?.poems || 0) !== 1 ? 's' : ''}</span>
                      <span>{new Date(collection.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {(activeTab === "followers" || activeTab === "following") && (
          <div className="user-list" style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px", margin: "0 auto" }}>
            {(() => {
              const list = activeTab === "followers" ? user.followersList : user.followingList
              if (!list || list.length === 0) {
                return (
                  <div className="empty-state">
                    <i className="ti ti-users" aria-hidden="true"></i>
                    <p>{activeTab === "followers" ? "You don't have any followers yet." : "You aren't following anyone yet."}</p>
                  </div>
                )
              }
              return list.map(u => (
                <Link key={u.id} href={`/author/${u.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <div className="card card-compact" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
                    {u.image ? (
                      <img src={u.image} alt={u.name} className="avatar avatar-md" style={{ objectFit: "cover" }} />
                    ) : (
                      <div className="avatar avatar-md avatar-warm">
                        {u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "15px" }}>{u.name}</div>
                      {u.bio && <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{u.bio}</div>}
                    </div>
                    <i className="ti ti-chevron-right" style={{ color: "var(--text-tertiary)" }}></i>
                  </div>
                </Link>
              ))
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
