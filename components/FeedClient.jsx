"use client"

import { useState, useTransition, useEffect, useRef } from "react"
import Link from "next/link"
import PoemCard from "@/components/PoemCard"
import FeaturedPoemCard from "@/components/FeaturedPoemCard"
import Sidebar from "@/components/Sidebar"
import Avatar from "@/components/Avatar"
import { toggleFollow } from "@/app/actions/interactions"
import { getPaginatedPoems } from "@/app/actions/poems"

/**
 * A self-contained follow button for an author in the mobile trending strip.
 * Manages its own state to avoid prop-drilling.
 */
function MobileFollowButton({ authorId, initialFollowing }) {
  const [following, setFollowing] = useState(initialFollowing)
  const [isPending, startTransition] = useTransition()

  const handleFollow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setFollowing(f => !f)
    startTransition(async () => { await toggleFollow(authorId) })
  }

  return (
    <button
      className={`btn ${following ? "btn-primary" : "btn-ghost"} btn-sm`}
      onClick={handleFollow}
      disabled={isPending}
    >
      {following ? "Following" : "Follow"}
    </button>
  )
}

export default function FeedClient({
  initialPoems,
  featuredPoems = [],
  tags,
  trendingAuthors,
  initialLikedPoemIds = [],
  initialFollowedAuthorIds = [],
  currentUserId = null,
  initialNextCursor = null
}) {
  const [activeTag, setActiveTag] = useState("all")
  const [poems, setPoems] = useState(initialPoems)
  const [nextCursor, setNextCursor] = useState(initialNextCursor)
  const [loading, setLoading] = useState(false)
  const [loadingTag, setLoadingTag] = useState(false)
  const observerTarget = useRef(null)

  const likedSet    = new Set(initialLikedPoemIds)
  const followedSet = new Set(initialFollowedAuthorIds)

  // Filter featured poems by tag locally
  const filteredFeatured = activeTag === "all"
    ? featuredPoems
    : activeTag === "following"
      ? featuredPoems.filter(p => followedSet.has(p.authorId))
      : featuredPoems.filter(p => p.tags?.map(t => t.name).includes(activeTag))

  const handleTagClick = async (tag) => {
    if (tag === activeTag) return
    setActiveTag(tag)
    setLoadingTag(true)
    try {
      const res = await getPaginatedPoems({ activeTag: tag, limit: 6 })
      setPoems(res.poems)
      setNextCursor(res.nextCursor)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingTag(false)
    }
  }

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    if (!nextCursor || loading || loadingTag) return

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          setLoading(true)
          try {
            const res = await getPaginatedPoems({
              cursor: nextCursor,
              activeTag,
              limit: 6
            })
            setPoems(prev => [...prev, ...res.poems])
            setNextCursor(res.nextCursor)
          } catch (e) {
            console.error(e)
          } finally {
            setLoading(false)
          }
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    )

    const target = observerTarget.current
    if (target) {
      observer.observe(target)
    }

    return () => {
      if (target) {
        observer.unobserve(target)
      }
    }
  }, [nextCursor, activeTag, loading, loadingTag])

  const allEmpty = poems.length === 0 && filteredFeatured.length === 0

  return (
    <div className="feed-layout">
      <div className="feed-main">

        {/* Tag filter strip */}
        <div className="tag-row-scroll" style={{ marginBottom: "20px" }}>
          <span
            className={`tag ${activeTag === "all" ? "active" : ""}`}
            onClick={() => handleTagClick("all")}
          >
            All
          </span>
          {currentUserId && (
            <span
              className={`tag ${activeTag === "following" ? "active" : ""}`}
              onClick={() => handleTagClick("following")}
            >
              Following
            </span>
          )}
          {tags.map(tag => (
            <span
              key={tag}
              className={`tag ${activeTag === tag ? "active" : ""}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Feed content */}
        <div id="poem-feed" style={{ transition: "opacity 0.3s ease", opacity: loadingTag ? 0.6 : 1 }}>

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

              {/* ── Mobile-only: Trending Authors swipe strip ── */}
              {trendingAuthors && trendingAuthors.length > 0 && (
                <section className="mobile-feed-interrupt mobile-authors-strip" aria-label="Trending authors">
                  <div className="mobile-feed-interrupt__header">
                    <span className="section-title" style={{ margin: 0 }}>Trending authors</span>
                  </div>
                  <div className="mobile-snap-scroll" role="list">
                    {trendingAuthors.map(author => {
                      if (!author) return null
                      return (
                        <article key={author.id} className="mobile-author-card" role="listitem">
                          <Link href={`/author/${author.id}`} className="mobile-author-card__link">
                            <Avatar image={author.image} name={author.name} size="md" />
                            <div className="mobile-author-card__name">{author.name}</div>
                            {author.bio && (
                              <div className="mobile-author-card__bio">{author.bio}</div>
                            )}
                          </Link>
                          <MobileFollowButton
                            authorId={author.id}
                            initialFollowing={followedSet.has(author.id)}
                          />
                        </article>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* ── Mobile-only: Popular Tags swipe strip ──────── */}
              {tags && tags.length > 0 && (
                <section className="mobile-feed-interrupt mobile-tags-strip" aria-label="Popular tags">
                  <div className="mobile-feed-interrupt__header">
                    <span className="section-title" style={{ margin: 0 }}>Popular tags</span>
                  </div>
                  <div className="mobile-tags-scroll">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className={`tag ${activeTag === tag ? "active" : ""}`}
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Regular poem grid ──────────────────────── */}
              {poems.length > 0 && (
                <div className="regular-poem-grid">
                  {poems.map(poem => (
                    <PoemCard
                      key={poem.id}
                      poem={poem}
                      initialLiked={likedSet.has(poem.id)}
                      isMine={currentUserId && poem.authorId === currentUserId}
                    />
                  ))}
                </div>
              )}

              {/* Infinite Scroll target & loading spinner */}
              {nextCursor && (
                <div 
                  ref={observerTarget}
                  data-testid="infinite-scroll-trigger"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "32px 0",
                    width: "100%"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)" }}>
                    <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", fontSize: "20px" }} aria-hidden="true"></i>
                    <span style={{ fontSize: "14px", fontWeight: "500" }}>Loading more poems...</span>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <Sidebar
        activeTag={activeTag}
        onTagSelect={handleTagClick}
        trendingAuthors={trendingAuthors}
        allTags={tags}
        initialFollowedAuthorIds={initialFollowedAuthorIds}
      />
    </div>
  )
}

