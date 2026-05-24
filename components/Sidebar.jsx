"use client"

import { useState } from "react"
import Link from "next/link"
import { authors, trendingAuthors, allTags, isFollowing, toggleFollow } from "@/lib/data"

export default function Sidebar({ activeTag, onTagSelect }) {
  // A local component for the Follow button to manage its own state
  const FollowButton = ({ authorId }) => {
    const [following, setFollowing] = useState(isFollowing(authorId))
    return (
      <button 
        className={`btn ${following ? "btn-primary" : "btn-ghost"} btn-sm`}
        onClick={() => setFollowing(toggleFollow(authorId))}
      >
        {following ? "Following" : "Follow"}
      </button>
    )
  }

  return (
    <div className="feed-sidebar">
      <div className="section-title">Trending authors</div>
      <div className="author-list">
        {trendingAuthors.map((authorId, idx) => {
          const author = authors.find(a => a.id === authorId)
          if (!author) return null
          return (
            <div key={author.id}>
              {idx > 0 && <hr className="divider" />}
              <div className="author-list-item" style={{ paddingTop: idx > 0 ? "12px" : "0" }}>
                <div className="author-list-info">
                  <div className={`avatar ${author.avatarClass}`}>{author.initials}</div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "500" }}>
                      <Link href={`/author/${author.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {author.name}
                      </Link>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>{author.bio}</div>
                  </div>
                </div>
                <FollowButton authorId={author.id} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border-tertiary)" }}>
        <div className="section-title">Popular tags</div>
        <div className="tag-row">
          {allTags.map(tag => (
            <span 
              key={tag} 
              className={`tag ${activeTag === tag ? "active" : ""}`} 
              onClick={() => onTagSelect(tag)}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
