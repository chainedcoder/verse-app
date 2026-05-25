"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { getNotifications, markNotificationsAsRead } from "@/app/actions/notifications"
import { searchPoems } from "@/app/actions/poems"

export default function Nav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  // Theme state
  const [theme, setTheme] = useState("light")
  const themeIcon = theme === "dark" ? "ti-sun" : "ti-moon"

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false)
      }
    }
    
    if (showDropdown || showSearchDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showDropdown, showSearchDropdown])

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayFn = setTimeout(async () => {
        setIsSearching(true)
        const res = await searchPoems(searchQuery)
        setSearchResults(res.poems || [])
        setIsSearching(false)
        setShowSearchDropdown(true)
      }, 300)
      return () => clearTimeout(delayFn)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.getAttribute("data-theme") || "light")
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    setTheme(document.documentElement.getAttribute("data-theme") || "light")
    return () => observer.disconnect()
  }, [])

  const toggleDrawer = () => setDrawerOpen(!drawerOpen)
  const closeDrawer = () => setDrawerOpen(false)

  useEffect(() => {
    if (session?.user) {
      getNotifications().then(res => {
        if (res.success) {
          setNotifications(res.notifications)
          setUnreadCount(res.unreadCount)
        }
      })
    }
  }, [session])

  const handleMarkAllRead = async (e) => {
    if (e) e.preventDefault()
    if (unreadCount > 0) {
      await markNotificationsAsRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
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
          <div className="navbar-desktop-actions">
            <div style={{ position: "relative" }} ref={searchRef}>
              <form action="/search" style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="ti ti-search" aria-hidden="true" style={{ position: "absolute", left: "12px", color: "var(--text-tertiary)", pointerEvents: "none" }}></i>
                <input 
                  type="search" 
                  name="q" 
                  placeholder="Search..." 
                  className="input" 
                  style={{ width: "200px", paddingLeft: "36px", height: "26px" }}
                  aria-label="Search poems and authors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                  autoComplete="off"
                />
              </form>
              
              {showSearchDropdown && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, marginTop: "8px",
                  backgroundColor: "var(--bg-card)", border: "1px solid var(--border-secondary)",
                  borderRadius: "8px", maxHeight: "300px", overflowY: "auto",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 100
                }}>
                  {isSearching ? (
                    <div style={{ padding: "12px", textAlign: "center", color: "var(--text-tertiary)" }}>
                      <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }}></i>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {searchResults.map(poem => (
                        <Link key={poem.id} href={`/poem/${poem.id}`} 
                          style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-tertiary)", textDecoration: "none", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "4px" }}
                          onClick={() => { setShowSearchDropdown(false); setSearchQuery(""); }}
                        >
                          <span style={{ fontSize: "14px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{poem.title}</span>
                          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>by {poem.author?.name}</span>
                        </Link>
                      ))}
                      <Link href={`/search?q=${encodeURIComponent(searchQuery)}`} 
                        style={{ padding: "10px 12px", textAlign: "center", fontSize: "13px", color: "var(--primary)", textDecoration: "none" }}
                        onClick={() => { setShowSearchDropdown(false); setSearchQuery(""); }}
                      >
                        View all results
                      </Link>
                    </div>
                  ) : (
                    <div style={{ padding: "12px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "13px" }}>
                      No poems found
                    </div>
                  )}
                </div>
              )}
            </div>

            <button className="btn btn-ghost btn-sm" id="theme-toggle" aria-label="Toggle theme" onClick={togglePanel}>
              <i className={`ti ${themeIcon}`} aria-hidden="true"></i>
            </button>
            
            {session ? (
              <>
                <Link href="/write" className="btn btn-primary btn-sm">Write</Link>
                <div style={{ position: "relative" }} ref={dropdownRef}>
                  <div 
                    className="avatar avatar-warm" 
                    onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }} 
                    style={{ width: "25px", height: "25px", fontSize: "10px", cursor: "pointer", position: "relative", userSelect: "none" }}
                  >
                    {session.user?.name ? session.user.name.match(/\b\w/g)?.join('').substring(0, 2).toUpperCase() : '?'}
                    {unreadCount > 0 && (
                      <span style={{
                        position: "absolute", top: "-2px", right: "-2px",
                        width: "8px", height: "8px", borderRadius: "50%", 
                        backgroundColor: "var(--danger)", border: "1px solid var(--bg-primary)"
                      }}></span>
                    )}
                  </div>
                  {showDropdown && (
                    <div style={{
                      position: "absolute", top: "100%", right: "0", marginTop: "8px",
                      backgroundColor: "var(--bg-card)", border: "1px solid var(--border-secondary)",
                      borderRadius: "8px", width: "300px", maxHeight: "500px", overflowY: "auto",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 100,
                      display: "flex", flexDirection: "column"
                    }}>
                      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-secondary)", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                        <div className="avatar avatar-sm avatar-warm">
                          {session.user?.name ? session.user.name.match(/\b\w/g)?.join('').substring(0, 2).toUpperCase() : '?'}
                        </div>
                        <span style={{ fontSize: "14px" }}>{session.user?.name}</span>
                      </div>
                      
                      <div style={{ padding: "8px 16px 4px", fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "11px" }}>Mark all read</button>
                        )}
                      </div>
                      
                      {notifications.length === 0 ? (
                        <div style={{ padding: "12px 16px", color: "var(--text-tertiary)", fontSize: "13px" }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <Link key={notif.id} href={notif.poemId ? `/poem/${notif.poemId}` : `/author/${notif.actorId}`} 
                            style={{ 
                              padding: "10px 16px", display: "flex", gap: "10px", alignItems: "flex-start",
                              borderBottom: "1px solid var(--border-tertiary)", textDecoration: "none",
                              backgroundColor: notif.read ? "transparent" : "var(--bg-secondary)"
                            }}
                            onClick={() => { setShowDropdown(false); if (!notif.read) handleMarkAllRead(); }}
                          >
                            <div style={{
                              width: "28px", height: "28px", borderRadius: "50%",
                              backgroundColor: "var(--primary)", color: "white",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "10px", flexShrink: 0, overflow: "hidden"
                            }}>
                              {notif.actor?.image ? <img src={notif.actor.image} alt="" style={{width: "100%", height: "100%", objectFit: "cover"}} /> : (notif.actor?.name?.charAt(0).toUpperCase() || "?")}
                            </div>
                            <div style={{ fontSize: "13px", color: "var(--text-primary)" }}>
                              <strong>{notif.actor?.name}</strong>{" "}
                              {notif.type === "LIKE" ? "liked your poem" : 
                               notif.type === "COMMENT" ? "commented on your poem" : "started following you"}
                              {notif.poem && <span> <em>{notif.poem.title}</em></span>}
                              <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: "4px" }}>
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                      
                      <Link href="/profile" onClick={() => setShowDropdown(false)} style={{ padding: "12px 16px", textDecoration: "none", color: "var(--text-primary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-secondary)" }}>
                        <i className="ti ti-user" style={{ fontSize: "16px" }}></i> Profile
                      </Link>
                      
                      <Link href="/settings/profile" onClick={() => setShowDropdown(false)} style={{ padding: "12px 16px", textDecoration: "none", color: "var(--text-primary)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="ti ti-settings" style={{ fontSize: "16px" }}></i> Settings
                      </Link>
                      
                      <button 
                        onClick={() => signOut()}
                        style={{ padding: "12px 16px", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", color: "var(--danger)", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", borderTop: "1px solid var(--border-secondary)" }}
                      >
                        <i className="ti ti-logout" style={{ fontSize: "16px" }}></i> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm" id="nav-login">Log in</Link>
                <Link href="/signup" className="btn btn-primary btn-sm" id="nav-signup">Sign up</Link>
              </>
            )}
          </div>

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
        <div className="mobile-drawer-link" style={{ cursor: "pointer" }} onClick={(e) => { togglePanel(e); closeDrawer(); }}>
          <i className={`ti ${themeIcon}`} aria-hidden="true"></i> Appearance
        </div>
        <hr className="mobile-drawer-divider" />
        
        {session ? (
          <>
            <Link href="/write" className="btn btn-primary btn-full" style={{ marginBottom: "8px" }} onClick={closeDrawer}>Write</Link>
            <Link href="/profile" className="btn btn-ghost btn-full" style={{ marginBottom: "8px" }} onClick={closeDrawer}>Profile</Link>
            <Link href="/settings/profile" className="btn btn-ghost btn-full" style={{ marginBottom: "8px" }} onClick={closeDrawer}>Settings</Link>
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
