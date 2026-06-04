"use client"

import React, { useRef, useState, useLayoutEffect } from "react"

export const SIZE_PRESETS = [
  { id: "square", w: 1080, h: 1080, name: "Square (1:1)" },
  { id: "portrait", w: 1080, h: 1350, name: "Portrait (4:5)" },
  { id: "story", w: 1080, h: 1920, name: "Story (9:16)" },
  { id: "tablet", w: 1536, h: 2048, name: "Tablet (3:4)" }
]

export function ExportNode({ poem, author, template, colors, width, height }) {
  const c = colors
  const padding = width * 0.08

  const displayAuthorName = poem.customAuthorName || author.name

  const exportPrefs = typeof author?.exportPreferences === 'string'
    ? JSON.parse(author.exportPreferences)
    : (author?.exportPreferences || {})

  const watermarkPos = exportPrefs?.watermark || "bottom-right"
  const watermarkMargin = exportPrefs?.margin || 20

  const renderWatermark = () => {
    if (watermarkPos === "none") return null
    const isLeft = watermarkPos === "bottom-left"
    const username = author?.username || author?.name?.replace(/\s+/g, '').toLowerCase() || "sno"

    return (
      <div style={{
        position: "absolute",
        bottom: `${watermarkMargin}px`,
        [isLeft ? "left" : "right"]: `${watermarkMargin}px`,
        fontSize: `${Math.max(16, width * 0.02)}px`,
        fontFamily: "'Inter', sans-serif",
        opacity: 0.5,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: c.text,
        zIndex: 100,
        whiteSpace: "nowrap"
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="none" stroke={c.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
        <span style={{ color: c.text }}>https://verse.sno.center/{username}</span>
      </div>
    )
  }

  const innerRef = useRef(null)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    if (innerRef.current && height) {
      // Temporarily remove transform to measure true natural height
      const el = innerRef.current;
      const oldTransform = el.style.transform;
      el.style.transform = 'none';

      const naturalHeight = el.scrollHeight;

      if (naturalHeight > height) {
        // We add a tiny buffer (e.g. 0.98) so it doesn't touch the exact pixel edge
        setScale((height / naturalHeight) * 0.96);
      } else {
        setScale(1);
      }

      el.style.transform = oldTransform;
    } else {
      setScale(1);
    }
  }, [poem.fullText, width, height, template]);

  const outerStyle = {
    width: `${width}px`,
    height: height ? `${height}px` : 'auto',
    backgroundColor: c.bg,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: 0,
    boxSizing: "border-box",
    position: "relative"
  }

  const innerStyle = {
    width: `${width}px`,
    minHeight: height ? `${height}px` : "auto", padding: `${padding}px`,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: c.text,
    fontFamily: "'Playfair Display', serif",
    transform: `scale(${scale})`,
    transformOrigin: "center center",
    position: "relative",
  }

  if (template === "siteview") {
    return (
      <div style={outerStyle}>
        <div ref={innerRef} style={innerStyle}>
          <h1 style={{ color: c.accent, fontSize: `${Math.max(42, width * 0.06)}px`, fontWeight: "bold", margin: `0 0 ${padding}px 0`, textAlign: "left", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {poem.title}
          </h1>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "-20px", top: "-10px", bottom: "-10px", width: "5px", backgroundColor: c.accent }} />
            <div style={{ fontSize: `${Math.max(28, width * 0.035)}px`, fontStyle: "italic", lineHeight: 2.0, whiteSpace: "pre-wrap", paddingLeft: "30px" }}>
              {poem.fullText}
            </div>
          </div>
          <div style={{ marginTop: `${padding}px`, fontSize: `${Math.max(20, width * 0.028)}px`, fontFamily: "'Inter', sans-serif", opacity: 0.6 }}>
            — {displayAuthorName}
          </div>
        </div>
        {renderWatermark()}
      </div>
    )
  }

  if (template === "minimal" || template === "dark") {
    return (
      <div style={outerStyle}>
        <div ref={innerRef} style={innerStyle}>
          <h1 style={{ color: c.text, fontSize: `${Math.max(48, width * 0.065)}px`, fontWeight: "bold", margin: `0 0 ${padding}px 0`, textAlign: "left", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {poem.title}
          </h1>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", left: "-20px", top: "-10px", bottom: "-10px", width: "4px", backgroundColor: c.accent }} />
            <div style={{ fontSize: `${Math.max(28, width * 0.038)}px`, fontStyle: "italic", lineHeight: 1.8, whiteSpace: "pre-wrap", paddingLeft: "10px" }}>
              {poem.fullText}
            </div>
          </div>
          <div style={{ marginTop: `${padding}px`, fontSize: `${Math.max(20, width * 0.028)}px`, fontFamily: "'Inter', sans-serif", opacity: 0.6 }}>
            — {displayAuthorName}
          </div>
        </div>
        {renderWatermark()}
      </div>
    )
  }

  if (template === "love") {
    return (
      <div style={outerStyle}>
        <div ref={innerRef} style={{ ...innerStyle, justifyContent: "center" }}>
          <div style={{ position: "absolute", right: `${padding}px`, top: `${padding}px`, opacity: 0.15, fontSize: `${width * 0.18}px`, color: c.accent }}>❧</div>
          <h1 style={{ color: c.accent, fontSize: `${Math.max(56, width * 0.08)}px`, fontWeight: "bold", textTransform: "uppercase", margin: `0 0 ${padding * 0.8}px 0`, textAlign: "left", whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {poem.title}
          </h1>
          <div style={{ fontSize: `${Math.max(28, width * 0.038)}px`, fontStyle: "italic", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {poem.fullText}
          </div>
          <div style={{ marginTop: `${padding}px`, fontSize: `${Math.max(20, width * 0.028)}px`, fontFamily: "'Inter', sans-serif", opacity: 0.6 }}>
            — {displayAuthorName}
          </div>
        </div>
        {renderWatermark()}
      </div>
    )
  }

  // story
  return (
    <div style={outerStyle}>
      <div ref={innerRef} style={{ ...innerStyle, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <h1 style={{ color: c.text, fontSize: `${Math.max(44, width * 0.06)}px`, fontStyle: "italic", margin: `0 0 ${padding * 0.8}px 0`, whiteSpace: "pre-wrap", wordWrap: "break-word", width: "100%" }}>
          {poem.title}
        </h1>
        <div style={{ fontSize: `${Math.max(28, width * 0.04)}px`, fontStyle: "italic", lineHeight: 1.6, whiteSpace: "pre-wrap", width: "100%" }}>
          {poem.fullText}
        </div>
        <div style={{ marginTop: `${padding}px`, fontSize: `${Math.max(20, width * 0.028)}px`, fontFamily: "'Inter', sans-serif", opacity: 0.6 }}>
          — {displayAuthorName}
        </div>
        <div style={{ position: "absolute", bottom: `${padding}px`, fontSize: `${Math.max(16, width * 0.02)}px`, opacity: 0.4, fontFamily: "'Inter', sans-serif" }}>
          verse.app
        </div>
      </div>
      {renderWatermark()}
    </div>
  )
}
