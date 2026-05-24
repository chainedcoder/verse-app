"use client"

import { useState } from "react"
import PoemCard from "@/components/PoemCard"
import Sidebar from "@/components/Sidebar"

export default function FeedClient({ initialPoems, tags, trendingAuthors }) {
  const [activeTag, setActiveTag] = useState("all")

  // The tags are stored as a comma separated string in DB
  const filteredPoems = activeTag === "all" 
    ? initialPoems 
    : initialPoems.filter(p => p.tags.split(',').includes(activeTag))

  return (
    <div className="feed-layout">
      <div className="feed-main">
        <div className="tag-row-scroll" style={{ marginBottom: "20px" }}>
          <span 
            className={`tag ${activeTag === "all" ? "active" : ""}`} 
            onClick={() => setActiveTag("all")}
          >
            All
          </span>
          {tags.map(tag => (
            <span 
              key={tag}
              className={`tag ${activeTag === tag ? "active" : ""}`} 
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="poem-feed-container" style={{ transition: "opacity 0.3s ease" }}>
          {filteredPoems.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-feather" aria-hidden="true"></i>
              <p>No poems found for this tag</p>
            </div>
          ) : (
            filteredPoems.map(poem => <PoemCard key={poem.id} poem={poem} />)
          )}
        </div>
      </div>

      <Sidebar activeTag={activeTag} onTagSelect={setActiveTag} trendingAuthors={trendingAuthors} allTags={tags} />
    </div>
  )
}
