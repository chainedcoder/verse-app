/** Shared artwork keeps the layout cards and downloaded artwork consistent. */
export default function CreativeLayout({ template, colors: c, poem, width, showAuthor, displayAuthor }) {
  const botanical = template === "botanical"
  const editorial = template === "editorial"
  const tidal = template === "tidal"
  const solstice = template === "solstice"
  const leftAligned = botanical || editorial || tidal
  const labels = { botanical: "The poetry herbarium", celestial: "A little light, in words", solstice: "Words for the golden hour", tidal: "Let the words find shore", editorial: "Poetry / collected words" }
  const unit = width / 1080
  return (
    <div data-layout={template} style={{ position: "relative", width: "100%", boxSizing: "border-box", padding: `${70 * unit}px ${38 * unit}px`, color: c.text, fontFamily: "'Playfair Display', serif", textAlign: leftAligned ? "left" : "center", border: editorial || tidal ? "none" : `${2 * unit}px solid ${c.accent}`, borderRadius: solstice ? `${240 * unit}px ${240 * unit}px 0 0` : 0 }}>
      {editorial ? <div aria-hidden="true" style={{ fontSize: `${120 * unit}px`, lineHeight: 0.8, color: c.accent, borderTop: `${6 * unit}px solid ${c.accent}`, paddingTop: `${28 * unit}px`, marginBottom: `${32 * unit}px` }}>“</div> :
      <svg data-artwork={template} aria-hidden="true" viewBox="-12 -24 264 144" style={{ display: "block", width: `${280 * unit}px`, height: `${116 * unit}px`, margin: botanical ? `0 0 ${36 * unit}px auto` : `0 auto ${36 * unit}px`, color: c.accent }} fill="none" stroke="currentColor" strokeWidth="1.2">
        {botanical ? <>
          <path d="M25 91Q112 68 210 24" />
          {[0.15, 0.32, 0.49, 0.66, 0.83].map(t => <g key={t} transform={`translate(${25 + 174 * t + 11 * t * t} ${91 - 46 * t - 21 * t * t}) rotate(-18)`}>
            <path d="M0 0Q-4-29 18-37Q28-12 0 0Z" fill="currentColor" fillOpacity=".12" />
            <path d="M0 0Q17 23 36 13Q28-5 0 0Z" fill="currentColor" fillOpacity=".08" />
            <path d="M0 0L16-31M0 0L30 12" opacity=".4" strokeWidth=".6" />
          </g>)}
        </> : solstice ? <>
          <path d="M70 82V55a50 50 0 0 1 100 0v27M82 82V55a38 38 0 0 1 76 0v27M94 82V55a26 26 0 0 1 52 0v27" />
          <path d="M45 82h150M120-12v-8M51 6l-8-8M189 6l8-8M40 43h-12M200 43h12" />
        </> : tidal ? <>
          {[20, 38, 56, 74].map(y => <path key={y} d={`M8 ${y}Q62 ${y - 27} 120 ${y}T232 ${y}`} opacity={1 - y / 110} />)}
          <circle cx="185" cy="-2" r="12" fill="currentColor" fillOpacity=".12" />
        </> : <>
          <ellipse cx="120" cy="50" rx="100" ry="29" transform="rotate(-15 120 50)" opacity=".5" />
          <path d="M135 16A35 35 0 1 0 143 77A31 31 0 0 1 135 16Z" fill="currentColor" fillOpacity=".15" />
          <path d="M32 17v12m-6-6h12M203 65v18m-9-9h18M180 11v8m-4-4h8" />
          <circle cx="58" cy="76" r="2" fill="currentColor" />
        </>}
      </svg>}
      <div style={{ fontFamily: "'Inter', sans-serif", textTransform: "uppercase", letterSpacing: `${5 * unit}px`, fontSize: `${18 * unit}px`, color: c.accent, marginBottom: `${28 * unit}px` }}>{labels[template]}</div>
      <h1 style={{ color: c.text, fontSize: `${(editorial ? 78 : 60) * unit}px`, fontWeight: editorial ? 700 : 500, textTransform: editorial ? "uppercase" : "none", lineHeight: 1.2, margin: `0 0 ${40 * unit}px`, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{poem.title}</h1>
      <div style={{ width: editorial ? "100%" : `${80 * unit}px`, height: `${2 * unit}px`, background: c.accent, margin: leftAligned ? `0 0 ${40 * unit}px` : `0 auto ${40 * unit}px` }} />
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
