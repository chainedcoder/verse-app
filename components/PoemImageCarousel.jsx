"use client"

import { useState, useRef } from "react"
import Image from "next/image"

export default function PoemImageCarousel({ images, featured = false }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef(null)

  if (!images || images.length === 0) return null

  const handleScroll = (e) => {
    if (!scrollRef.current) return
    const scrollPosition = e.target.scrollLeft
    const width = e.target.offsetWidth
    const newIndex = Math.round(scrollPosition / width)
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
    }
  }

  const scrollTo = (index) => {
    if (!scrollRef.current) return
    const width = scrollRef.current.offsetWidth
    scrollRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth'
    })
    setCurrentIndex(index)
  }

  return (
    <div className="poem-image-carousel" style={{ position: "relative", width: "100%", marginBottom: "24px" }}>
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{ 
          display: "flex", 
          overflowX: "auto", 
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE
          borderRadius: "12px",
          aspectRatio: featured ? "16/9" : "4/3",
          backgroundColor: "var(--bg-secondary)"
        }}
        className="hide-scrollbar"
      >
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        
        {images.map((img, idx) => (
          <div 
            key={img.id || idx} 
            style={{ 
              flex: "0 0 100%", 
              scrollSnapAlign: "start",
              position: "relative" 
            }}
          >
            <img
              src={img.url}
              alt={img.alt || "Poem Illustration"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "12px" }}>
          {images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => scrollTo(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: currentIndex === idx ? "var(--primary)" : "var(--border)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "background-color 0.2s"
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
