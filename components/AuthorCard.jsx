"use client"

import { useState, useTransition } from "react"
import { toggleFollow } from "@/app/actions/interactions"

export default function AuthorCard({ author, initialFollowing = false }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  const handleFollow = () => {
    setFollowing(!following)
    startTransition(async () => {
      await toggleFollow(author.id)
    })
  }

  return (
    <div className="author-side-panel">
      <div className={`avatar avatar-lg ${author.avatarClass}`} style={{ marginBottom: "12px" }}>
        {author.initials}
      </div>
      <div className="author-name">{author.name}</div>
      <div className="author-bio">{author.bio}</div>
      <div className="author-stats">
        <span><strong>{author.poems}</strong> poems</span>
        <span><strong>{author.readers}</strong> readers</span>
      </div>
      <button 
        className={`btn ${following ? "btn-primary" : "btn-ghost"} btn-full`}
        onClick={handleFollow}
        style={{ fontSize: "12px" }}
      >
        {following ? "Following" : "Follow author"}
      </button>
    </div>
  )
}
