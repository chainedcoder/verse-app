"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toggleFollow } from "@/app/actions/interactions"

export default function Sidebar({ activeTag, onTagSelect, trendingAuthors = [], allTags = [], initialFollowedAuthorIds = [] }) {
  const followedSet = new Set(initialFollowedAuthorIds)
  
  // A local component for the Follow button to manage its own state
  const FollowButton = ({ authorId }) => {
    const [following, setFollowing] = useState(followedSet.has(authorId))
    const [isPending, startTransition] = useTransition()

    const handleFollow = () => {
      setFollowing(!following)
      startTransition(async () => {
        await toggleFollow(authorId)
      })
    }

    return (
      <button 
        className={`btn ${following ? "btn-primary" : "btn-ghost"} btn-sm`}
        onClick={handleFollow}
      >
        {following ? "Following" : "Follow"}
      </button>
    )
  }

  return (
    <div className="feed-sidebar">
      <div className="section-title">Trending authors</div>
      <div className="author-list">
        {trendingAuthors.map((author, idx) => {
          if (!author) return null
          const initials = author.name ? author.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?'
          return (
            <div key={author.id}>
              {idx > 0 && <hr className="divider" />}
              <div className="author-list-item" style={{ paddingTop: idx > 0 ? "12px" : "0" }}>
                <div className="author-list-info">
                  <div className={`avatar ${author.image}`}>{initials}</div>
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
