"use client"

import { useState, useEffect } from "react"
import { getTheme, getAccent, setTheme, setAccent, getAccents } from "@/lib/theme"

export default function ThemePanel() {
  const [theme, setThemeState] = useState("light")
  const [accent, setAccentState] = useState("indigo")
  const accents = ["indigo", "rose", "emerald", "amber", "violet", "ocean"]

  useEffect(() => {
    // Initialize
    Promise.resolve().then(() => {
      setThemeState(getTheme())
      setAccentState(getAccent())
    })

    const handleThemeChange = (e) => setThemeState(e.detail.theme)
    const handleAccentChange = (e) => setAccentState(e.detail.accent)

    window.addEventListener("themechange", handleThemeChange)
    window.addEventListener("accentchange", handleAccentChange)

    // Close on click outside
    const handleClickOutside = (e) => {
      const panel = document.getElementById("theme-panel")
      const toggle = document.getElementById("theme-toggle")
      if (panel && panel.classList.contains("open")) {
        if (!panel.contains(e.target) && e.target !== toggle && (!toggle || !toggle.contains(e.target))) {
          panel.classList.remove("open")
        }
      }
    }
    document.addEventListener("click", handleClickOutside)

    return () => {
      window.removeEventListener("themechange", handleThemeChange)
      window.removeEventListener("accentchange", handleAccentChange)
      document.removeEventListener("click", handleClickOutside)
    }
  }, [])

  const handleSetTheme = (mode) => {
    setTheme(mode)
    setThemeState(mode)
  }

  const handleSetAccent = (color) => {
    setAccent(color)
    setAccentState(color)
  }

  return (
    <div className="theme-panel" id="theme-panel">
      <div className="theme-panel-title">Appearance</div>

      <div className="theme-mode-toggle">
        <button 
          className={`theme-mode-option ${theme === "light" ? "active" : ""}`} 
          onClick={() => handleSetTheme("light")}
        >
          <i className="ti ti-sun" style={{ fontSize: "14px" }} aria-hidden="true"></i> Light
        </button>
        <button 
          className={`theme-mode-option ${theme === "dark" ? "active" : ""}`} 
          onClick={() => handleSetTheme("dark")}
        >
          <i className="ti ti-moon" style={{ fontSize: "14px" }} aria-hidden="true"></i> Dark
        </button>
      </div>

      <div className="accent-label">Accent color</div>
      <div className="accent-swatches">
        {accents.map((a) => (
          <button
            key={a}
            className={`accent-swatch accent-swatch-${a} ${accent === a ? "active" : ""}`}
            title={a.charAt(0).toUpperCase() + a.slice(1)}
            aria-label={`Set accent color to ${a}`}
            onClick={() => handleSetAccent(a)}
          ></button>
        ))}
      </div>
    </div>
  )
}
