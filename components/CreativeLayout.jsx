/** Shared artwork keeps the layout cards and downloaded artwork consistent. */
export default function CreativeLayout({ template, colors: c, poem, width, showAuthor, displayAuthor }) {
  const botanical = template === "botanical"
  const unit = width / 1080
  return (
    <div data-layout={template} style={{ position: "relative", width: "100%", boxSizing: "border-box", padding: `${70 * unit}px ${38 * unit}px`, color: c.text, fontFamily: "'Playfair Display', serif", textAlign: botanical ? "left" : "center", border: `${2 * unit}px solid ${c.accent}` }}>
      <svg aria-hidden="true" viewBox="0 0 240 100" style={{ display: "block", width: `${280 * unit}px`, height: `${116 * unit}px`, margin: botanical ? `0 0 ${36 * unit}px auto` : `0 auto ${36 * unit}px`, color: c.accent }} fill="none" stroke="currentColor" strokeWidth="1.2">
        {botanical ? <>
          <path d="M25 87Q115 80 207 12" />
          {[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${42 + i * 31} ${78 - i * 12}) rotate(-24)`}>
            <path d="M0 0Q-4-29 18-37Q28-12 0 0Z" fill="currentColor" fillOpacity=".12" />
            <path d="M0 0Q17 23 36 13Q28-5 0 0Z" fill="currentColor" fillOpacity=".08" />
          </g>)}
        </> : <>
          <ellipse cx="120" cy="50" rx="100" ry="29" transform="rotate(-15 120 50)" opacity=".5" />
          <path d="M135 16A35 35 0 1 0 143 77A31 31 0 0 1 135 16Z" fill="currentColor" fillOpacity=".15" />
          <path d="M32 17v12m-6-6h12M203 65v18m-9-9h18M180 11v8m-4-4h8" />
          <circle cx="58" cy="76" r="2" fill="currentColor" />
        </>}
      </svg>
      <div style={{ fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: `${5 * unit}px`, fontSize: `${18 * unit}px`, color: c.accent, marginBottom: `${28 * unit}px` }}>{botanical ? "The poetry herbarium" : "A little light, in words"}</div>
      <h1 style={{ color: c.text, fontSize: `${60 * unit}px`, fontWeight: 500, lineHeight: 1.2, margin: `0 0 ${40 * unit}px`, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{poem.title}</h1>
      <div style={{ width: `${80 * unit}px`, height: `${2 * unit}px`, background: c.accent, margin: botanical ? `0 0 ${40 * unit}px` : `0 auto ${40 * unit}px` }} />
      <div style={{ fontSize: `${36 * unit}px`, lineHeight: 1.85, fontStyle: "italic", whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{poem.fullText}</div>
      {showAuthor && <div style={{ marginTop: `${48 * unit}px`, fontFamily: "'Inter', sans-serif", fontSize: `${24 * unit}px`, color: c.accent }}>— {displayAuthor}</div>}
    </div>
  )
}

export function CreativeLayoutPreview({ template, colors, poem, showAuthor, displayAuthor }) {
  return (
    <div style={{ height: 200, overflow: "hidden", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 280, transform: "scale(0.68)", flexShrink: 0 }}>
        <CreativeLayout
          template={template}
          colors={colors}
          poem={{ ...poem, fullText: poem.fullText.split("\n").slice(0, 2).join("\n") }}
          width={280}
          showAuthor={showAuthor}
          displayAuthor={displayAuthor}
        />
      </div>
    </div>
  )
}
