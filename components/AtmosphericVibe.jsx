"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AtmosphericVibe({ poem, config, isFeatured = false }) {
  const [options, setOptions] = useState([])

  useEffect(() => {
    let selected = [];
    
    if (config && Array.isArray(config) && config.length > 0) {
      // Strictly respect author preferences if provided
      selected = [...config];
    } else {
      // Smart fallback based on poem excerpt length for poems without specific vibe config
      const numLines = (poem.excerpt || '').split('\n').length;
      
      if (numLines <= 6) {
        // Plenty of space: show all three to fill the void
        selected = ['reflection', 'related', 'illustration'];
      } else if (numLines <= 12) {
        // Medium space: ideally 2 items
        const textOption = Math.random() > 0.5 ? 'reflection' : 'related';
        selected = [textOption, 'illustration'];
      } else {
        // Little space: fallback to 1
        const allOptions = ['illustration', 'reflection', 'related'];
        selected = [allOptions[Math.floor(Math.random() * allOptions.length)]];
      }
    }
    
    selected = selected.map(opt => {
      if (opt === 'A') return 'related';
      if (opt === 'B') return 'illustration';
      if (opt === 'C') return 'reflection';
      return opt;
    });
    
    selected = Array.from(new Set(selected));
    
    const sortedSelected = selected.sort((a, b) => {
      const orderA = a === 'reflection' ? 1 : a === 'related' ? 2 : 3;
      const orderB = b === 'reflection' ? 1 : b === 'related' ? 2 : 3;
      return orderA - orderB;
    });
    setOptions(sortedSelected);
  }, [poem.id, config, poem.excerpt])

  if (!options || options.length === 0) return null

  const renderOption = (opt, index) => {
    const isLast = index === options.length - 1;
    const borderStyle = index === 0 ? {} : { borderTop: "0.5px solid var(--border-tertiary)" };

    if (opt === 'A' || opt === 'related') {
      return (
        <div key={opt} className="related-section" style={{ padding: "16px 0", overflowY: "auto", ...borderStyle }} onClick={(e) => e.stopPropagation()}>
          <Link href={`/author/${poem.authorId}`} className="related-title" style={{ display: "block", fontSize: "11px", fontWeight: 500, color: "var(--text-secondary)", marginBottom: "12px", textTransform: "uppercase", textDecoration: "none" }}>More from {poem.author?.name}</Link>
          <Link href={`/author/${poem.authorId}`} className="related-item" style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 0", borderBottom: "none", textDecoration: "none", color: "inherit" }}>
            <div className="rel-dot" style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-feather" aria-hidden="true" style={{ fontSize: "14px", color: "var(--text-secondary)" }}></i>
            </div>
            <div className="rel-text" style={{ fontSize: "12px" }}>
              <div className="rel-name" style={{ color: "var(--text-primary)", fontFamily: "var(--font-serif)", fontStyle: "italic", lineHeight: 1.4 }}>Because I could not stop for Death —</div>
              <div className="rel-meta" style={{ color: "var(--text-secondary)", fontSize: "11px", marginTop: "2px" }}>#MORTALITY · 2m read</div>
            </div>
          </Link>
        </div>
      )
    }

    if (opt === 'B' || opt === 'illustration') {
      const edgeMargin = isFeatured ? "0 -32px" : "0 -24px";
      return (
        <div key={opt} className="illustration" style={{ flex: 1, minHeight: "160px", margin: edgeMargin, background: "#FBEAF0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", ...borderStyle }}>
          <svg className="feather-svg" width="180" height="140" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.22 }}>
            <ellipse cx="90" cy="70" rx="18" ry="60" fill="#D4537E" transform="rotate(-15 90 70)"/>
            <line x1="90" y1="10" x2="90" y2="130" stroke="#993556" strokeWidth="1.5" transform="rotate(-15 90 70)"/>
            <line x1="75" y1="35" x2="90" y2="42" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="72" y1="50" x2="90" y2="57" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="73" y1="65" x2="90" y2="70" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="76" y1="80" x2="90" y2="84" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="105" y1="35" x2="90" y2="42" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="108" y1="50" x2="90" y2="57" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="107" y1="65" x2="90" y2="70" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <line x1="104" y1="80" x2="90" y2="84" stroke="#993556" strokeWidth="0.8" transform="rotate(-15 90 70)"/>
            <ellipse cx="130" cy="40" rx="10" ry="32" fill="#F4C0D1" transform="rotate(20 130 40)" opacity="0.6"/>
            <ellipse cx="50" cy="95" rx="8" ry="25" fill="#F4C0D1" transform="rotate(-25 50 95)" opacity="0.5"/>
          </svg>
        </div>
      )
    }

    if (opt === 'C' || opt === 'reflection') {
      return (
        <div key={opt} className="reflection" style={{ padding: "20px 0", ...borderStyle, display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
          <p className="reflection-q" style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px", fontStyle: "italic", textAlign: "left" }}>What does this poem bring up for you?</p>
          <div className="reflection-chips" style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "flex-start" }}>
            <span className="tag" style={{ fontSize: "10px", padding: "2px 8px" }}>Comfort</span>
            <span className="tag" style={{ fontSize: "10px", padding: "2px 8px" }}>Longing</span>
            <span className="tag" style={{ fontSize: "10px", padding: "2px 8px" }}>Resilience</span>
            <span className="tag" style={{ fontSize: "10px", padding: "2px 8px" }}>Peace</span>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "flex-end" }}>
      {options.map((opt, i) => renderOption(opt, i))}
    </div>
  )
}
