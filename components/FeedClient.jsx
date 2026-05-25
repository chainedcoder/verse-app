"use client"

import { useState } from "react"
import PoemCard from "@/components/PoemCard"
import FeaturedPoemCard from "@/components/FeaturedPoemCard"
import Sidebar from "@/components/Sidebar"

export default function FeedClient({
  initialPoems,
  featuredPoems = [],
  tags,
  trendingAuthors,
  initialLikedPoemIds = [],
  initialFollowedAuthorIds = [],
  currentUserId = null
}) {
  const [activeTag, setActiveTag] = useState("all")

  const likedSet    = new Set(initialLikedPoemIds)
  const followedSet = new Set(initialFollowedAuthorIds)

  // Filter regular poems by tag
  const filteredPoems = activeTag === "all"
    ? initialPoems
    : initialPoems.filter(p => p.tags?.map(t => t.name).includes(activeTag))

  // Filter featured poems by tag too
  const filteredFeatured = activeTag === "all"
    ? featuredPoems
    : featuredPoems.filter(p => p.tags?.map(t => t.name).includes(activeTag))

  const allEmpty = filteredPoems.length === 0 && filteredFeatured.length === 0

  return (
    <div className="feed-layout">
      <div className="feed-main">

        {/* Tag filter strip */}
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

        {/* Feed content */}
        <div id="poem-feed" style={{ transition: "opacity 0.3s ease" }}>

          {allEmpty ? (
            <div className="empty-state">
              <i className="ti ti-feather" aria-hidden="true" />
              <p>No poems found for this tag</p>
            </div>
          ) : (
            <>
              {/* ── Featured hero strip ─────────────────────── */}
              {filteredFeatured.length > 0 && (
                <section className="featured-strip" aria-label="Featured poems">
                  {filteredFeatured.map(poem => (
                    <FeaturedPoemCard
                      key={poem.id}
                      poem={poem}
                      initialLiked={likedSet.has(poem.id)}
                      isMine={currentUserId && poem.authorId === currentUserId}
                    />
                  ))}
                </section>
              )}

              {/* ── Regular poem grid ──────────────────────── */}
              {filteredPoems.length > 0 && (
                <div className="regular-poem-grid">
                  {filteredPoems.map(poem => (
                    <PoemCard
                      key={poem.id}
                      poem={poem}
                      initialLiked={likedSet.has(poem.id)}
                      isMine={currentUserId && poem.authorId === currentUserId}
                    />
                  ))}
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <Sidebar
        activeTag={activeTag}
        onTagSelect={setActiveTag}
        trendingAuthors={trendingAuthors}
        allTags={tags}
        initialFollowedAuthorIds={initialFollowedAuthorIds}
      />
    </div>
  )
}
