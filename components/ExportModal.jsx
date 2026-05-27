"use client"

import { useState, useEffect, useCallback } from "react"
import { getTheme, getAccent } from "@/lib/theme"

const accentDefs = {
  indigo: { h: 235, s: 45 },
  rose: { h: 348, s: 60 },
  emerald: { h: 160, s: 50 },
  amber: { h: 32, s: 65 },
  violet: { h: 270, s: 50 },
  ocean: { h: 200, s: 60 },
}

function hsl(h, s, l) {
  return `hsl(${h}, ${s}%, ${l}%)`
}

/**
 * ExportModal — renders the full export/download UI inside a modal overlay.
 *
 * Props:
 *   poem   — the poem object (must have .title, .fullText, .id)
 *   author — the author object (must have .name)
 *   onClose — callback to close the modal
 */
export default function ExportModal({ poem, author, onClose }) {
  const [selectedTemplate, setSelectedTemplate] = useState("siteview")
  const [colorIndex, setColorIndex] = useState(0)
  const [previewImage, setPreviewImage] = useState(null)
  const [tick, setTick] = useState(0)

  // Listen for theme / accent changes so preview re-renders correctly
  useEffect(() => {
    const handleThemeChange = () => setTick(t => t + 1)
    window.addEventListener("themechange", handleThemeChange)
    window.addEventListener("accentchange", handleThemeChange)
    return () => {
      window.removeEventListener("themechange", handleThemeChange)
      window.removeEventListener("accentchange", handleThemeChange)
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  const previewLines = poem.fullText.split("\n").slice(0, 4)
  const storyLines = poem.fullText.split("\n").slice(0, 2)
  const loveLines = poem.fullText.split("\n").slice(1, 3)

  const getSiteViewColors = useCallback(() => {
    const accent = getAccent() || "indigo"
    const def = accentDefs[accent] || accentDefs.indigo
    return [
      { bg: "#faf8f4", text: "#1a1a2e", accent: hsl(def.h, def.s, 22), label: "Light" },
      { bg: "#0e0e1a", text: "#e8e4dc", accent: hsl(def.h, def.s, 72), label: "Dark" },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const templateColors = {
    siteview: getSiteViewColors(),
    minimal: [
      { bg: "#ffffff", text: "#1a1a1a", accent: "#1a1a2e" },
      { bg: "#f9f6f0", text: "#2c2820", accent: "#4a3f35" },
      { bg: "#e8e6e1", text: "#1a1a1a", accent: "#222222" },
    ],
    dark: [
      { bg: "#12112a", text: "#e8e0d4", accent: "#3a3660" },
      { bg: "#1a1a1a", text: "#e8e8e8", accent: "#444444" },
      { bg: "#11221c", text: "#d4e8dd", accent: "#2a4a38" },
    ],
    love: [
      { bg: "#f5f0e4", text: "#1a1a1a", accent: "#c0392b" },
      { bg: "#fff0f3", text: "#2a1a1c", accent: "#d65a73" },
      { bg: "#fcedea", text: "#2c1e1c", accent: "#b05050" },
    ],
    story: [
      { bg: "#2d1f3d", text: "#f0e8ff", accent: "#9b7eb8" },
      { bg: "#0d1117", text: "#c9d1d9", accent: "#58a6ff" },
      { bg: "#3d261f", text: "#ffece8", accent: "#d97c66" },
    ],
  }

  const currentColors = templateColors[selectedTemplate][colorIndex] || templateColors[selectedTemplate][0]

  const handleTemplateSelect = (tmpl) => {
    if (tmpl === selectedTemplate) return
    setSelectedTemplate(tmpl)
    setColorIndex(0)
  }

  const generateCanvas = useCallback(() => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const c = currentColors

    const cfg = {
      w: 1080,
      h: selectedTemplate === "story" ? 1920 : 1350,
      bg: c.bg,
      textColor: c.text,
      accent: c.accent,
    }

    canvas.width = cfg.w
    canvas.height = cfg.h

    ctx.fillStyle = cfg.bg
    ctx.fillRect(0, 0, cfg.w, cfg.h)

    if (selectedTemplate === "love") {
      ctx.fillStyle = c.accent
      ctx.globalAlpha = 0.15
      ctx.font = "200px serif"
      ctx.fillText("❧", cfg.w - 260, 220)
      ctx.globalAlpha = 1.0
    }

    const padding = 100
    let y = selectedTemplate === "story" ? 400 : 200
    const x = selectedTemplate === "story" ? cfg.w / 2 : padding

    function wrapText(context, text, px, py, maxWidth, lineHeight) {
      const words = text.split(" ")
      let line = ""
      let currentY = py
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " "
        const metrics = context.measureText(testLine)
        if (metrics.width > maxWidth && n > 0) {
          context.fillText(line.trim(), px, currentY)
          line = words[n] + " "
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      context.fillText(line.trim(), px, currentY)
      return currentY
    }

    if (selectedTemplate === "siteview") {
      ctx.fillStyle = cfg.accent
      ctx.textAlign = "left"
      ctx.fillStyle = cfg.textColor
      ctx.font = "bold 42px Playfair Display, serif"
      const maxTitleWidth = cfg.w - padding * 2
      y = wrapText(ctx, poem.title, padding, y, maxTitleWidth, 64)
      y += 100

      ctx.fillStyle = cfg.textColor
      ctx.font = "italic 20px Playfair Display, serif"
      const poemBorderStartY = y - 50

      const lines = poem.fullText.split("\n")
      lines.forEach(line => {
        if (line.trim() === "") y += 30
        else {
          ctx.fillText(line, padding + 30, y)
          y += 50
        }
      })

      ctx.fillStyle = cfg.accent
      ctx.fillRect(padding - 20, poemBorderStartY, 5, y - poemBorderStartY - 20)

      y += 40
      ctx.fillStyle = cfg.textColor
      ctx.globalAlpha = 0.6
      ctx.font = "24px Inter, sans-serif"
      ctx.fillText(`— ${author.name}`, padding, y)

      return canvas
    }

    ctx.textAlign = selectedTemplate === "story" ? "center" : "left"
    const maxTitleWidth = cfg.w - padding * 2

    if (selectedTemplate === "love") {
      ctx.fillStyle = cfg.accent
      ctx.font = "bold 72px Playfair Display, serif"
      y = wrapText(ctx, poem.title.toUpperCase(), padding, y, maxTitleWidth, 80)
      y += 80
    } else {
      ctx.fillStyle = cfg.textColor
      ctx.font =
        selectedTemplate === "story"
          ? "italic 46px Playfair Display, serif"
          : "bold 52px Playfair Display, serif"
      const lineHeight = selectedTemplate === "story" ? 50 : 64
      y = wrapText(ctx, poem.title, x, y, maxTitleWidth, lineHeight)
      y += selectedTemplate === "story" ? 80 : 100
    }

    ctx.fillStyle = cfg.textColor
    ctx.font = `italic ${selectedTemplate === "story" ? "32" : "30"}px Playfair Display, serif`
    ctx.textAlign = selectedTemplate === "story" ? "center" : "left"

    if (selectedTemplate === "minimal" || selectedTemplate === "dark") {
      const borderStartY = y - 10
      ctx.fillStyle = cfg.textColor
      const lines = poem.fullText.split("\n")
      lines.forEach(line => {
        if (line.trim() === "") y += 30
        else {
          ctx.fillText(line, padding + 10, y)
          y += 50
        }
      })
      ctx.fillStyle = cfg.accent
      ctx.fillRect(padding - 20, borderStartY, 4, y - borderStartY - 20)
    } else {
      const lines = poem.fullText.split("\n")
      lines.forEach(line => {
        if (line.trim() === "") y += 30
        else {
          ctx.fillText(line, x, y)
          y += 50
        }
      })
    }

    y += 40
    ctx.fillStyle = cfg.textColor
    ctx.globalAlpha = 0.6
    ctx.font = "24px Inter, sans-serif"
    ctx.fillText(`— ${author.name}`, x, y)

    if (selectedTemplate === "story") {
      ctx.fillText("verse.app", cfg.w / 2, cfg.h - 100)
    }

    return canvas
  }, [selectedTemplate, currentColors, poem, author])

  const handlePreview = () => {
    const canvas = generateCanvas()
    setPreviewImage(canvas.toDataURL())
  }

  const handleDownload = () => {
    const canvas = generateCanvas()
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `verse-${poem.id}-${selectedTemplate}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, "image/png")
  }

  const templates = [
    {
      id: "siteview",
      title: "Site view",
      desc: "As seen on Verse",
      content: c => (
        <div className="template-preview template-preview-siteview" style={{ background: c.bg, color: c.text }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{poem.title}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic", paddingLeft: "8px", borderLeft: `3px solid ${c.accent}` }}>
            {previewLines.map((l, i) => <div key={i}>{l || <br />}</div>)}
          </div>
          <div style={{ marginTop: "12px", fontSize: "9px", opacity: 0.6 }}>— {author.name}</div>
        </div>
      ),
    },
    {
      id: "minimal",
      title: "Minimal",
      desc: "Clean borders",
      content: c => (
        <div className="template-preview template-preview-minimal" style={{ background: c.bg, color: c.text }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{poem.title}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic", paddingLeft: "8px", borderLeft: `2px solid ${c.accent}` }}>
            {previewLines.map((l, i) => <div key={i}>{l || <br />}</div>)}
          </div>
          <div style={{ marginTop: "12px", fontSize: "9px", opacity: 0.6 }}>— {author.name}</div>
        </div>
      ),
    },
    {
      id: "dark",
      title: "Dark cinematic",
      desc: "Deep and moody",
      content: c => (
        <div className="template-preview template-preview-dark" style={{ background: c.bg, color: c.text }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{poem.title}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic", paddingLeft: "8px", borderLeft: `2px solid ${c.accent}` }}>
            {previewLines.map((l, i) => <div key={i}>{l || <br />}</div>)}
          </div>
          <div style={{ marginTop: "12px", fontSize: "9px", opacity: 0.6 }}>— {author.name}</div>
        </div>
      ),
    },
    {
      id: "love",
      title: "Love letter",
      desc: "Elegant romance",
      content: c => (
        <div className="template-preview template-preview-love" style={{ background: c.bg, color: c.text }}>
          <div style={{ position: "absolute", right: "14px", top: "14px", opacity: 0.15, fontSize: "40px", color: c.accent }}>❧</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: c.accent, lineHeight: 1.1, marginBottom: "10px", textTransform: "uppercase" }}>{poem.title}</div>
          <div style={{ fontSize: "9px", opacity: 0.7, lineHeight: 1.7, fontStyle: "italic" }}>
            {loveLines.map((l, i) => <div key={i}>{l || <br />}</div>)}
          </div>
        </div>
      ),
    },
    {
      id: "story",
      title: "Story format",
      desc: "Instagram 9:16",
      content: c => (
        <div className="template-preview template-preview-story" style={{ background: c.bg, color: c.text }}>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "6px", textAlign: "center" }}>{poem.title}</div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.8, fontStyle: "italic", textAlign: "center" }}>
            {storyLines.map((l, i) => <div key={i}>{l || <br />}</div>)}
          </div>
          <div style={{ fontSize: "9px", opacity: 0.6, textAlign: "center", marginTop: "12px" }}>— {author.name}</div>
        </div>
      ),
    },
  ]

  return (
    <div
      className="export-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`Export "${poem.title}"`}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      data-testid="export-modal"
    >
      <div className="export-modal-panel">
        {/* Header */}
        <div className="export-modal-header">
          <div>
            <h2 className="export-modal-title">Download poem</h2>
            <p className="export-modal-subtitle">Choose a style to export as an image</p>
          </div>
          <button
            className="export-modal-close"
            onClick={onClose}
            aria-label="Close export modal"
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        {/* Template carousel */}
        <div className="export-modal-body">
          <div className="template-carousel" style={{
            display: "flex",
            overflowX: "auto",
            gap: "16px",
            paddingBottom: "16px",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}>
            {templates.map(tmpl => {
              const isSelected = selectedTemplate === tmpl.id
              const previewColors = isSelected ? currentColors : templateColors[tmpl.id][0]
              return (
                <div
                  key={tmpl.id}
                  className={`template-card ${isSelected ? "selected" : ""}`}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleTemplateSelect(tmpl.id)
                    }
                  }}
                  style={{ flex: "0 0 220px", scrollSnapAlign: "start" }}
                >
                  {tmpl.content(previewColors)}
                  <div className="template-info">
                    <div>
                      <div className="template-info-name">{tmpl.title}</div>
                      <div className="template-info-desc">{tmpl.desc}</div>
                    </div>
                    {isSelected ? (
                      <div className="card-palette" style={{ display: "flex", gap: "6px" }}>
                        {templateColors[tmpl.id].map((c, idx) => (
                          <div
                            key={idx}
                            className={`theme-accent-color ${idx === colorIndex ? "active" : ""}`}
                            onClick={e => { e.stopPropagation(); setColorIndex(idx) }}
                            style={{
                              background: c.bg,
                              border: `1px solid ${idx === colorIndex ? "var(--accent)" : c.text}`,
                              opacity: idx === colorIndex ? "1" : "0.6",
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              cursor: "pointer",
                              boxShadow: idx === colorIndex ? "0 0 0 2px var(--bg-card)" : "none",
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <i className="ti ti-download" style={{ fontSize: "14px", color: "var(--text-tertiary)" }} aria-hidden="true" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="export-modal-footer">
          <button className="btn btn-ghost" onClick={handlePreview} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <i className="ti ti-eye" style={{ fontSize: "14px" }} aria-hidden="true" /> Preview
          </button>
          <button className="btn btn-primary" onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: "6px" }} data-testid="export-modal-download">
            <i className="ti ti-download" style={{ fontSize: "14px" }} aria-hidden="true" /> Download
          </button>
        </div>
      </div>

      {/* Image preview lightbox */}
      {previewImage && (
        <div
          className="preview-modal"
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)", display: "flex",
            justifyContent: "center", alignItems: "center",
            zIndex: 10001, padding: "40px", cursor: "zoom-out",
          }}
        >
          <div style={{ position: "relative", maxHeight: "100%", maxWidth: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src={previewImage}
              alt="Poem preview"
              style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", cursor: "default" }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={() => setPreviewImage(null)}
              style={{ position: "absolute", top: "-40px", right: "-40px", background: "none", border: "none", color: "white", fontSize: "32px", cursor: "pointer", opacity: 0.8 }}
              onMouseEnter={e => e.currentTarget.style.opacity = "1"}
              onMouseLeave={e => e.currentTarget.style.opacity = "0.8"}
              aria-label="Close preview"
            >
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
