"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  // Theme state
  const [theme, setTheme] = useState("light")
  const themeIcon = theme === "dark" ? "ti-sun" : "ti-moon"
  const themeLabel = theme === "dark" ? "Light" : "Dark"

  useEffect(() => {
    // Read theme from html data-theme attribute which is set by theme.js or ThemeProvider
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    setTheme(document.documentElement.getAttribute("data-theme") || "light")
    return () => observer.disconnect()
  }, [])

  const toggleDrawer = () => setDrawerOpen(!drawerOpen)
  const closeDrawer = () => setDrawerOpen(false)

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", next)
    try { localStorage.setItem("verse_theme", next) } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }))
  }

  const togglePanel = (e) => {
    e.stopPropagation()
    const panel = document.getElementById("theme-panel")
    if (panel) panel.classList.toggle("open")
  }

  return (
    <>
      <nav className="navbar" id="navbar">
        <Link className="navbar-logo" href="/" onClick={closeDrawer}>verse</Link>

        <div className="navbar-links" id="nav-links">
          <Link className={`navbar-link ${pathname === "/" ? "active" : ""}`} href="/">Discover</Link>
          <Link className={`navbar-link ${pathname === "/collections" ? "active" : ""}`} href="/collections">Collections</Link>
          <Link className={`navbar-link ${pathname === "/authors" ? "active" : ""}`} href="/authors">Authors</Link>
        </div>

        <div className="navbar-actions">
          <form action="/search" className="nav-search">
            <i className="ti ti-search nav-search-icon" aria-hidden="true"></i>
            <input 
              type="search" 
              name="q" 
              placeholder="Search..." 
              className="nav-search-input" 
              aria-label="Search poems and authors"
            />
          </form>

          <button className="btn btn-ghost btn-sm" id="theme-toggle" aria-label={`${themeLabel} mode`} onClick={togglePanel}>
            <i className={`ti ${themeIcon}`} aria-hidden="true"></i> {themeLabel}
          </button>
          
          {session ? (
            <>
              <Link href="/write" className="btn btn-primary btn-sm">Write</Link>
              <span className="navbar-username">{session.user?.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => signOut()}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login">Log in</Link>
              <Link href="/signup" className="btn btn-primary btn-sm" id="nav-signup">Sign up</Link>
            </>
          )}

          <button className={`hamburger ${drawerOpen ? "open" : ""}`} aria-label="Menu" onClick={toggleDrawer}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        </div>
      </nav>

      <div className={`drawer-overlay ${drawerOpen ? "open" : ""}`} onClick={closeDrawer} style={{ display: drawerOpen ? 'block' : 'none' }}></div>
      <div className={`mobile-drawer ${drawerOpen ? "open" : ""}`} style={{ display: drawerOpen ? 'flex' : 'none' }}>
        <form action="/search" style={{ marginBottom: "16px", position: "relative" }}>
          <i className="ti ti-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }}></i>
          <input 
            type="search" 
            name="q" 
            placeholder="Search poems, authors..." 
            className="input" 
            style={{ width: "100%", paddingLeft: "36px" }} 
          />
        </form>

        <Link className={`mobile-drawer-link ${pathname === "/" ? "active" : ""}`} href="/" onClick={closeDrawer}>
          <i className="ti ti-compass" aria-hidden="true"></i> Discover
        </Link>
        <Link className={`mobile-drawer-link ${pathname === "/collections" ? "active" : ""}`} href="/collections" onClick={closeDrawer}>
          <i className="ti ti-folders" aria-hidden="true"></i> Collections
        </Link>
        <Link className={`mobile-drawer-link ${pathname === "/authors" ? "active" : ""}`} href="/authors" onClick={closeDrawer}>
          <i className="ti ti-users" aria-hidden="true"></i> Authors
        </Link>
        <hr className="mobile-drawer-divider" />
        <div className="mobile-drawer-link" style={{ cursor: "pointer" }} onClick={() => { toggleTheme(); closeDrawer(); }}>
          <i className={`ti ${themeIcon}`} aria-hidden="true"></i> {themeLabel} mode
        </div>
        <hr className="mobile-drawer-divider" />
        
        {session ? (
          <>
            <Link href="/write" className="btn btn-primary btn-full" style={{ marginBottom: "8px" }} onClick={closeDrawer}>Write</Link>
            <button className="btn btn-ghost btn-full" onClick={() => { signOut(); closeDrawer(); }}>Sign out</button>
          </>
        ) : (
          <>
            <Link href="/login" className="btn btn-ghost btn-full" style={{ marginBottom: "8px" }} onClick={closeDrawer}>Log in</Link>
            <Link href="/signup" className="btn btn-primary btn-full" onClick={closeDrawer}>Sign up</Link>
          </>
        )}
      </div>
    </>
  )
}
