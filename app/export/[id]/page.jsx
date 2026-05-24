"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getPoem, getAuthor } from "@/lib/data"
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

export default function ExportPage(props) {
  const params = use(props.params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const poemId = params.id
  const poem = getPoem(poemId)
  
  const initialTemplate = searchParams.get("template") || "siteview"
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
  const [colorIndex, setColorIndex] = useState(0)
  const [previewImage, setPreviewImage] = useState(null)

  // Force re-render when theme changes so we pick up the new siteview colors
  const [tick, setTick] = useState(0)
  
  useEffect(() => {
    const handleThemeChange = () => setTick(t => t + 1)
    window.addEventListener("themechange", handleThemeChange)
    window.addEventListener("accentchange", handleThemeChange)
    return () => {
      window.removeEventListener("themechange", handleThemeChange)
      window.removeEventListener("accentchange", handleThemeChange)
    }
  }, [])

  if (!poem) {
    return (
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <h2 style={{ marginBottom: "8px" }}>Poem not found</h2>
        <button onClick={() => router.push("/")} className="btn btn-primary">Back to feed</button>
      </div>
    )
  }

  const author = getAuthor(poem.authorId)
  const previewLines = poem.fullText.split("\n").slice(0, 4)
  const storyLines = poem.fullText.split("\n").slice(0, 2)
  const loveLines = poem.fullText.split("\n").slice(1, 3)

  const getSiteViewColors = () => {
    const accent = getAccent() || "indigo"
    const def = accentDefs[accent] || accentDefs.indigo
    return [
      { bg: "#faf8f4", text: "#1a1a2e", accent: hsl(def.h, def.s, 22), label: "Light" },
      { bg: "#0e0e1a", text: "#e8e4dc", accent: hsl(def.h, def.s, 72), label: "Dark" },
    ]
  }

  const templateColors = {
    siteview: getSiteViewColors(),
    minimal: [
      { bg: "#ffffff", text: "#1a1a1a", accent: "#1a1a2e" },
      { bg: "#f9f6f0", text: "#2c2820", accent: "#4a3f35" },
      { bg: "#e8e6e1", text: "#1a1a1a", accent: "#222222" }
    ],
    dark: [
      { bg: "#12112a", text: "#e8e0d4", accent: "#3a3660" },
      { bg: "#1a1a1a", text: "#e8e8e8", accent: "#444444" },
      { bg: "#11221c", text: "#d4e8dd", accent: "#2a4a38" }
    ],
    love: [
      { bg: "#f5f0e4", text: "#1a1a1a", accent: "#c0392b" },
      { bg: "#fff0f3", text: "#2a1a1c", accent: "#d65a73" },
      { bg: "#fcedea", text: "#2c1e1c", accent: "#b05050" }
    ],
    story: [
      { bg: "#2d1f3d", text: "#f0e8ff", accent: "#9b7eb8" },
      { bg: "#0d1117", text: "#c9d1d9", accent: "#58a6ff" },
      { bg: "#3d261f", text: "#ffece8", accent: "#d97c66" }
    ]
  }

  const currentColors = templateColors[selectedTemplate][colorIndex] || templateColors[selectedTemplate][0]

  const handleTemplateSelect = (tmpl) => {
    if (tmpl === selectedTemplate) return
    setSelectedTemplate(tmpl)
    setColorIndex(0)
  }

  const generateCanvas = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const c = currentColors

    const cfg = {
      w: 1080,
      h: selectedTemplate === "story" ? 1920 : 1350,
      bg: c.bg,
      textColor: c.text,
      accent: c.accent
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
      const borderStartY = y - 10
      ctx.textAlign = "left"
      ctx.fillStyle = cfg.textColor
      ctx.font = "bold 42px Playfair Display, serif"
      const maxTitleWidth = cfg.w - (padding * 2)
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
    const maxTitleWidth = cfg.w - (padding * 2)
    
    if (selectedTemplate === "love") {
      ctx.fillStyle = cfg.accent
      ctx.font = "bold 72px Playfair Display, serif"
      y = wrapText(ctx, poem.title.toUpperCase(), padding, y, maxTitleWidth, 80)
      y += 80
    } else {
      ctx.fillStyle = cfg.textColor
      ctx.font = selectedTemplate === "story" ? "italic 46px Playfair Display, serif" : "bold 52px Playfair Display, serif"
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
  }

  const handlePreview = () => {
    const canvas = generateCanvas()
    const url = canvas.toDataURL()
    setPreviewImage(url)
  }

  const handleDownload = () => {
    const canvas = generateCanvas()
    canvas.toBlob((blob) => {
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

  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <div className="export-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
          <button className="poem-viewer-back" onClick={() => router.back()}>
            <i className="ti ti-arrow-left" style={{ fontSize: "18px" }} aria-hidden="true"></i>
            <span>Back to poem</span>
          </button>
        </div>
        <h2 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 4px", fontFamily: "'Inter',sans-serif" }}>
          Choose a layout for "{poem.title}"
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0" }}>
          Pick a style to download or share
        </p>
      </div>

      <div className="template-grid" style={{ marginTop: "24px" }}>
        
        {/* Template List */}
        {[
          { id: "siteview", title: "Site view", desc: "As seen on Verse", content: (c) => (
            <div className="template-preview template-preview-siteview" style={{ background: c.bg, color: c.text }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{poem.title}</div>
              <div className="siteview-border-line" style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic", paddingLeft: "8px", borderLeft: `3px solid ${c.accent}` }}>
                {previewLines.map((l, i) => <div key={i}>{l || <br/>}</div>)}
              </div>
              <div style={{ marginTop: "12px", fontSize: "9px", opacity: 0.6 }}>— {author.name}</div>
            </div>
          )},
          { id: "minimal", title: "Minimal", desc: "Clean borders", content: (c) => (
            <div className="template-preview template-preview-minimal" style={{ background: c.bg, color: c.text }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{poem.title}</div>
              <div className="minimal-border-line" style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic", paddingLeft: "8px", borderLeft: `2px solid ${c.accent}` }}>
                {previewLines.map((l, i) => <div key={i}>{l || <br/>}</div>)}
              </div>
              <div style={{ marginTop: "12px", fontSize: "9px", opacity: 0.6 }}>— {author.name}</div>
            </div>
          )},
          { id: "dark", title: "Dark cinematic", desc: "Deep and moody", content: (c) => (
            <div className="template-preview template-preview-dark" style={{ background: c.bg, color: c.text }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>{poem.title}</div>
              <div className="dark-border-line" style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.6, fontStyle: "italic", paddingLeft: "8px", borderLeft: `2px solid ${c.accent}` }}>
                {previewLines.map((l, i) => <div key={i}>{l || <br/>}</div>)}
              </div>
              <div style={{ marginTop: "12px", fontSize: "9px", opacity: 0.6 }}>— {author.name}</div>
            </div>
          )},
          { id: "love", title: "Love letter", desc: "Elegant romance", content: (c) => (
            <div className="template-preview template-preview-love" style={{ background: c.bg, color: c.text }}>
              <div className="love-leaf" style={{ position: "absolute", right: "14px", top: "14px", opacity: 0.15, fontSize: "40px", color: c.accent }}>❧</div>
              <div className="love-title" style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: c.accent, lineHeight: 1.1, marginBottom: "10px", textTransform: "uppercase" }}>{poem.title}</div>
              <div style={{ fontSize: "9px", opacity: 0.7, lineHeight: 1.7, fontStyle: "italic" }}>
                {loveLines.map((l, i) => <div key={i}>{l || <br/>}</div>)}
              </div>
            </div>
          )},
          { id: "story", title: "Story format", desc: "Instagram 9:16", content: (c) => (
            <div className="template-preview template-preview-story" style={{ background: c.bg, color: c.text }}>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "14px", fontWeight: "bold", marginBottom: "6px", textAlign: "center" }}>{poem.title}</div>
              <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "12px", lineHeight: 1.8, fontStyle: "italic", textAlign: "center" }}>
                {storyLines.map((l, i) => <div key={i}>{l || <br/>}</div>)}
              </div>
              <div style={{ fontSize: "9px", opacity: 0.6, textAlign: "center", marginTop: "12px" }}>— {author.name}</div>
            </div>
          )}
        ].map(tmpl => {
          const isSelected = selectedTemplate === tmpl.id
          const previewColors = isSelected ? currentColors : templateColors[tmpl.id][0]
          
          return (
            <div key={tmpl.id} className={`template-card ${isSelected ? "selected" : ""}`} onClick={() => handleTemplateSelect(tmpl.id)}>
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
                        onClick={(e) => { e.stopPropagation(); setColorIndex(idx) }}
                        style={{ background: c.bg, border: `1px solid ${idx === colorIndex ? "var(--accent)" : c.text}`, opacity: idx === colorIndex ? "1" : "0.6", width: "18px", height: "18px", borderRadius: "50%", cursor: "pointer", boxShadow: idx === colorIndex ? "0 0 0 2px var(--bg-card)" : "none" }}
                      ></div>
                    ))}
                  </div>
                ) : (
                  <i className="ti ti-download" style={{ fontSize: "14px", color: "var(--text-tertiary)" }} aria-hidden="true"></i>
                )}
              </div>
            </div>
          )
        })}

      </div>

      <div className="export-actions" style={{ position: "relative", display: "flex", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
        <button className="btn btn-ghost" onClick={handlePreview} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-eye" style={{ fontSize: "14px" }} aria-hidden="true"></i> Preview
        </button>
        <button className="btn btn-primary" onClick={handleDownload} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-download" style={{ fontSize: "14px" }} aria-hidden="true"></i> Download
        </button>
      </div>

      {previewImage && (
        <div 
          className="preview-modal" 
          onClick={() => setPreviewImage(null)} 
          style={{ 
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(0,0,0,0.8)", display: "flex", 
            justifyContent: "center", alignItems: "center", 
            zIndex: 1000, padding: "40px", cursor: "zoom-out" 
          }}
        >
          <div style={{ position: "relative", maxHeight: "100%", maxWidth: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img 
              src={previewImage} 
              alt="Poem preview" 
              style={{ maxHeight: "90vh", maxWidth: "90vw", objectFit: "contain", borderRadius: "8px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", cursor: "default" }} 
              onClick={(e) => e.stopPropagation()} 
            />
            <button 
              onClick={() => setPreviewImage(null)} 
              style={{ 
                position: "absolute", top: "-40px", right: "-40px", 
                background: "none", border: "none", color: "white", 
                fontSize: "32px", cursor: "pointer", opacity: 0.8
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
            >
              <i className="ti ti-x" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
