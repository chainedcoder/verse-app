"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { getTheme, getAccent } from "@/lib/theme"
import { toJpeg, toSvg } from "html-to-image"
import { jsPDF } from "jspdf"
import { ExportNode, SIZE_PRESETS } from "./ExportEngine"

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

export default function ExportPageClient({ poem, author }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialTemplate = searchParams.get("template") || "siteview"
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplate)
  const [colorIndex, setColorIndex] = useState(0)
  
  const [selectedSizeId, setSelectedSizeId] = useState(initialTemplate === "story" ? "story" : "portrait")
  const defaultSize = SIZE_PRESETS.find(s => s.id === (initialTemplate === "story" ? "story" : "portrait"))
  const [customWidth, setCustomWidth] = useState(defaultSize.w.toString())

  const [isExporting, setIsExporting] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  
  const exportContainerRef = useRef(null)
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
  
  // If custom size is empty or invalid, fallback to something reasonable
  const numericWidth = parseInt(customWidth, 10) || 1080
  const sizePreset = SIZE_PRESETS.find(s => s.id === selectedSizeId)
  
  // Keep height dynamic or enforce a proportion if needed?
  // Let's keep height dynamic by passing null, except for 'story' maybe we want a fixed minHeight.
  // Actually, 'story' has fixed aspect ratio 9:16. So we can calculate height based on width.
  let numericHeight = null;
  if (selectedTemplate === "story" || selectedSizeId === "story" || selectedSizeId === "mobile") {
    numericHeight = Math.round(numericWidth * (16 / 9))
  } else if (selectedSizeId === "square") {
    numericHeight = numericWidth;
  } else if (selectedSizeId === "portrait") {
    numericHeight = Math.round(numericWidth * (5 / 4))
  } else if (selectedSizeId === "tablet") {
    numericHeight = Math.round(numericWidth * (4 / 3))
  }

  const handleTemplateSelect = (tmpl) => {
    if (tmpl === selectedTemplate) return
    setSelectedTemplate(tmpl)
    setColorIndex(0)
    if (tmpl === "story") {
      setSelectedSizeId("story")
      setCustomWidth(SIZE_PRESETS.find(s => s.id === "story").w.toString())
    }
  }

  const handleSizePresetSelect = (presetId) => {
    setSelectedSizeId(presetId)
    const preset = SIZE_PRESETS.find(s => s.id === presetId)
    if (preset) {
      setCustomWidth(preset.w.toString())
    }
  }

  const getExportNode = () => {
    return exportContainerRef.current
  }

  const handlePreview = async () => {
    const node = getExportNode()
    if (!node) return
    try {
      const dataUrl = await toJpeg(node, { quality: 0.95, backgroundColor: currentColors.bg, fontEmbedCSS: `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');
` })
      setPreviewImage(dataUrl)
    } catch (err) {
      console.error("Failed to generate preview", err)
    }
  }

  const handleDownloadFormat = async (format) => {
    const node = getExportNode()
    if (!node) return
    
    setIsExporting(true)
    try {
      const fileName = `verse-${poem.id}-${selectedTemplate}`
      
      if (format === "jpeg") {
        const dataUrl = await toJpeg(node, { quality: 1, backgroundColor: currentColors.bg, fontEmbedCSS: `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');
` })
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `${fileName}.jpg`
        a.click()
      } else if (format === "svg") {
        const dataUrl = await toSvg(node, { backgroundColor: currentColors.bg, fontEmbedCSS: `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');
` })
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `${fileName}.svg`
        a.click()
      } else if (format === "pdf") {
        const dataUrl = await toJpeg(node, { quality: 1, backgroundColor: currentColors.bg, fontEmbedCSS: `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@300;400;500;600&display=swap');
` })
        const pdf = new jsPDF({
          orientation: numericWidth > (numericHeight || numericWidth) ? "landscape" : "portrait",
          unit: "px",
          format: [numericWidth, numericHeight || numericWidth]
        })
        pdf.addImage(dataUrl, "JPEG", 0, 0, numericWidth, numericHeight || numericWidth)
        pdf.save(`${fileName}.pdf`)
      }
    } catch (err) {
      console.error("Export failed", err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="page-container" style={{ padding: "32px 24px" }}>
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
          Pick a style and export format to download
        </p>
      </div>

      <div className="template-carousel" style={{ 
        display: "flex", 
        overflowX: "auto", 
        gap: "16px", 
        paddingBottom: "16px", 
        scrollSnapType: "x mandatory", 
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch"
      }}>
        
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
            <div key={tmpl.id} className={`template-card ${isSelected ? "selected" : ""}`} onClick={() => handleTemplateSelect(tmpl.id)} tabIndex={0} role="button" aria-pressed={isSelected} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTemplateSelect(tmpl.id); } }} style={{ flex: "0 0 280px", scrollSnapAlign: "start" }}>
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

      <div style={{ marginTop: "24px", padding: "16px", background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
        <h3 style={{ fontSize: "14px", marginBottom: "12px", fontFamily: "'Inter', sans-serif" }}>Dimensions / Viewport (px)</h3>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
          {SIZE_PRESETS.map(preset => (
            <button 
              key={preset.id}
              onClick={() => handleSizePresetSelect(preset.id)}
              className={`btn ${selectedSizeId === preset.id ? "btn-primary" : "btn-ghost"}`}
              style={{ fontSize: "13px", padding: "6px 12px", minHeight: "32px" }}
            >
              {preset.name}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Width:</label>
          <input 
            type="number" 
            value={customWidth} 
            onChange={(e) => {
              setCustomWidth(e.target.value)
              setSelectedSizeId("custom")
            }}
            className="input-field"
            style={{ width: "100px", padding: "6px 8px", fontSize: "13px", minHeight: "32px" }}
          />
          <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>px</span>
        </div>
      </div>

      <div className="export-actions" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px", marginTop: "24px" }}>
        <button className="btn btn-ghost" onClick={handlePreview} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-eye" style={{ fontSize: "14px" }} aria-hidden="true"></i> Preview
        </button>
        <button className="btn btn-primary" onClick={() => handleDownloadFormat("jpeg")} disabled={isExporting} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-photo" style={{ fontSize: "14px" }} aria-hidden="true"></i> JPEG
        </button>
        <button className="btn btn-primary" onClick={() => handleDownloadFormat("svg")} disabled={isExporting} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <i className="ti ti-vector" style={{ fontSize: "14px" }} aria-hidden="true"></i> SVG
        </button>
        <button className="btn btn-secondary" onClick={() => handleDownloadFormat("pdf")} disabled={isExporting} style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "var(--bg-elevated)" }}>
          <i className="ti ti-file-text" style={{ fontSize: "14px" }} aria-hidden="true"></i> PDF
        </button>
      </div>

      {/* Hidden container for rendering exact DOM to image */}
      <div style={{ position: "fixed", top: "-10000px", left: "-10000px", zIndex: -1 }}>
        <div ref={exportContainerRef}>
          <ExportNode 
            poem={poem} 
            author={author} 
            template={selectedTemplate} 
            colors={currentColors} 
            width={numericWidth}
            height={numericHeight}
          />
        </div>
      </div>

      {previewImage && (
        <div 
          className="preview-modal" 
          onClick={() => setPreviewImage(null)} 
          style={{ 
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: "rgba(0,0,0,0.85)", display: "flex", 
            justifyContent: "center", alignItems: "center", 
            zIndex: 10001, padding: "40px", cursor: "zoom-out" 
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
