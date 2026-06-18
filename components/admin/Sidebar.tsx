"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getTheme, getAccent, setTheme as setAppTheme, setAccent as setAppAccent } from '@/lib/theme';

// --- SVGs & Icons ---
const IconHome = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconUsers = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const IconBox = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;
const IconShield = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconCard = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
const IconTimer = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;

const IconChevronRight = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>;
const IconChevronLeft = () => <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"></polyline></svg>;
const IconChevronDown = () => <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"></polyline></svg>;

const IconSun = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const IconMoon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;
const IconMonitor = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;

export default function Sidebar() {
  const pathname = usePathname();
  
  // Sidebar expand state (default to narrow/collapsed)
  const [isExpanded, setIsExpanded] = useState(false);

  // Accordion expanded folders in wide state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    users: true,
    content: true,
    safety: true,
    finance: true,
  });

  // Active popup ID for collapsed state hover
  const [activePopupId, setActivePopupId] = useState<string | null>(null);

  // User menu and Theme panel states
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setThemeState] = useState('light');
  const [accent, setAccentState] = useState('indigo');
  const accents = ['indigo', 'rose', 'emerald', 'amber', 'violet', 'ocean'];

  useEffect(() => {
    // Load from localStorage if present
    try {
      const storedExpand = localStorage.getItem('admin_sidebar_expanded');
      if (storedExpand) setIsExpanded(storedExpand === 'true');
    } catch {}

    setThemeState(getTheme());
    setAccentState(getAccent());
    const handleThemeChange = (e: any) => setThemeState(e.detail.theme);
    const handleAccentChange = (e: any) => setAccentState(e.detail.accent);

    window.addEventListener('themechange', handleThemeChange);
    window.addEventListener('accentchange', handleAccentChange);

    // Click outside to close menus
    const clickOutside = (e: MouseEvent) => {
      const themeBtn = document.getElementById('admin-theme-toggle');
      const themePanel = document.getElementById('admin-theme-panel');
      if (themePanel && themeBtn && !themePanel.contains(e.target as Node) && !themeBtn.contains(e.target as Node)) {
        setShowThemePanel(false);
      }

      const userBtn = document.getElementById('admin-user-toggle');
      const userMenu = document.getElementById('admin-user-menu');
      if (userMenu && userBtn && !userMenu.contains(e.target as Node) && !userBtn.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', clickOutside);

    return () => {
      window.removeEventListener('themechange', handleThemeChange);
      window.removeEventListener('accentchange', handleAccentChange);
      document.removeEventListener('click', clickOutside);
    };
  }, []);

  const handleToggleExpand = () => {
    const nextVal = !isExpanded;
    setIsExpanded(nextVal);
    try { localStorage.setItem('admin_sidebar_expanded', String(nextVal)); } catch {}
  };

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleSignOut = async () => {
    const { signOut } = await import('next-auth/react');
    await signOut({ callbackUrl: '/login' });
  };

  const navSchema = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <IconHome />,
      href: '/admin'
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <IconUsers />,
      subItems: [
        { label: 'Users list', href: '/admin/users' },
        { label: 'Roles & Perms', href: '/admin/roles' }
      ]
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: <IconBox />,
      subItems: [
        { label: 'Tags Management', href: '/admin/tags' },
        { label: 'Ad Placements', href: '/admin/ads' },
        { label: 'Discovery Feed', href: '/admin/discovery' }
      ]
    },
    {
      id: 'safety',
      label: 'Safety & Reports',
      icon: <IconShield />,
      subItems: [
        { label: 'Moderation Feed', href: '/admin/moderation' },
        { label: 'User Reports', href: '/admin/reports' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance & Billing',
      icon: <IconCard />,
      subItems: [
        { label: 'Overview', href: '/admin/finance' },
        { label: 'Revenue Stats', href: '/admin/revenue' }
      ]
    },
    {
      id: 'timers',
      label: 'Timer list',
      icon: <IconTimer />,
      href: '/admin/timers'
    }
  ];

  return (
    <aside 
      className="admin-sidebar-left"
      style={{
        width: isExpanded ? '260px' : '80px',
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        alignItems: 'center',
        padding: isExpanded ? '24px 16px' : '24px 0',
        backgroundColor: theme === 'light' ? 'var(--accent, #7c3aed)' : '#111116',
        color: 'rgba(255, 255, 255, 0.65)',
        boxShadow: '4px 0 20px rgba(0,0,0,0.4)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 16px)',
        margin: '8px',
        borderRadius: '24px',
        flexShrink: 0,
        overflow: 'visible'
      }}
    >
      {/* Absolute Toggle Button (hanging off right border) */}
      <button 
        onClick={handleToggleExpand}
        title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        style={{
          position: 'absolute',
          right: '-14px',
          top: '32px',
          zIndex: 1000,
          backgroundColor: '#1c1c24',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          color: 'white',
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          outline: 'none',
          transition: 'background-color 0.2s, transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d2d3a'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1c1c24'}
      >
        {isExpanded ? <IconChevronLeft /> : <IconChevronRight />}
      </button>

      {/* Header Brand Logo Block */}
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '32px',
        padding: isExpanded ? '0 8px' : '0'
      }}>
        {isExpanded ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', paddingLeft: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
              <span style={{ fontSize: '18px', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>v</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'white', letterSpacing: '-0.01em', fontFamily: "'Playfair Display', serif" }}>verse</span>
            </div>
          </div>
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>v</span>
          </div>
        )}
      </div>

      {/* Navigation List */}
      <nav style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, padding: isExpanded ? '0 4px' : '0 16px', overflowY: isExpanded ? 'auto' : 'visible', overflowX: isExpanded ? 'hidden' : 'visible' }}>
        {navSchema.map((item) => {
          const hasSubItems = !!item.subItems;
          const isFolderOpen = !!expandedFolders[item.id];
          
          // Check if parent or any sub-items is active
          const isParentActive = item.href ? pathname === item.href : false;
          const isAnySubActive = hasSubItems && item.subItems!.some(sub => pathname === sub.href);
          const isActive = isParentActive || isAnySubActive;

          // Target Href for collapsed mode clicks (navigates directly to first child)
          const targetHref = item.href || (hasSubItems ? item.subItems![0].href : '#');

          return (
            <div 
              key={item.id} 
              style={{ width: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onMouseEnter={() => { if (!isExpanded) setActivePopupId(item.id); }}
              onMouseLeave={() => { if (!isExpanded) setActivePopupId(null); }}
            >
              {/* Collapsed Mode Trigger: Dynamic Link directly to first subpage */}
              {/* Collapsed Mode Trigger: Button or Link */}
              {!isExpanded ? (
                item.href ? (
                  <Link
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span style={{ color: 'inherit', display: 'flex' }}>
                      {item.icon}
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActivePopupId(activePopupId === item.id ? null : item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '48px',
                      height: '48px',
                      borderRadius: '16px',
                      transition: 'all 0.2s',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    <span style={{ color: 'inherit', display: 'flex' }}>
                      {item.icon}
                    </span>
                  </button>
                )
              ) : (
                /* Expanded Mode Trigger: Collapses/Expands Accordion Folder list */
                item.href ? (
                  <Link
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.65)',
                      textDecoration: 'none',
                      width: '100%',
                      justifyContent: 'flex-start',
                      height: 'auto'
                    }}
                  >
                    <span style={{ color: 'inherit', display: 'flex' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleFolder(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.65)',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      outline: 'none',
                      height: 'auto'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ color: 'inherit', display: 'flex' }}>
                        {item.icon}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 500 }}>{item.label}</span>
                    </div>
                    <span style={{ transform: isFolderOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', display: 'flex' }}>
                      <IconChevronDown />
                    </span>
                  </button>
                )
              )}

              {/* Accordion Sub-items (WIDEMODE ONLY) */}
              {isExpanded && hasSubItems && isFolderOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '4px' }}>
                  {item.subItems!.map((sub, sIdx) => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <div key={sub.href} style={{ display: 'flex', alignItems: 'center', paddingLeft: '32px', position: 'relative', height: '32px' }}>
                        {/* Custom visual branching lines */}
                        <div style={{
                          position: 'absolute',
                          left: '20px',
                          top: sIdx === 0 ? '50%' : 0,
                          bottom: sIdx === item.subItems!.length - 1 ? '50%' : 0,
                          width: '1px',
                          borderLeft: '1px solid rgba(255, 255, 255, 0.15)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          left: '20px',
                          top: '50%',
                          width: '10px',
                          height: '1px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.15)'
                        }} />
                        
                        <Link 
                          href={sub.href}
                          style={{
                            fontSize: '12px',
                          color: isSubActive ? (theme === 'light' ? 'white' : 'var(--accent, #a78bfa)') : 'rgba(255, 255, 255, 0.55)',
                          fontWeight: isSubActive ? 600 : 500,
                            textDecoration: 'none',
                            display: 'block',
                            width: '100%',
                            paddingLeft: '4px',
                            transition: 'color 0.15s'
                          }}
                          onMouseEnter={(e) => { if (!isSubActive) e.currentTarget.style.color = 'white'; }}
                          onMouseLeave={(e) => { if (!isSubActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.55)'; }}
                        >
                          {sub.label}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Hover Flyout Menus (NARROW MODE ONLY) */}
              {!isExpanded && hasSubItems && activePopupId === item.id && (
                <div style={{ position: 'absolute', left: '30px', top: '0px', paddingLeft: '30px', zIndex: 999999 }}>
                  <div 
                    id={`popup-${item.id}`}
                    style={{
                      width: '180px',
                      backgroundColor: theme === 'light' ? 'var(--accent, #7c3aed)' : '#16161c',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      boxShadow: 'var(--shadow-lg), 0 10px 30px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'white', padding: '4px 10px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '6px', paddingBottom: '8px' }}>
                    {item.label}
                  </div>
                  {item.subItems!.map(sub => {
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link 
                        key={sub.href}
                        href={sub.href}
                        style={{
                          display: 'block',
                          fontSize: '12.5px',
                          color: isSubActive ? (theme === 'light' ? 'white' : 'var(--accent, #a78bfa)') : 'rgba(255, 255, 255, 0.65)',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontWeight: isSubActive ? 600 : 500,
                          transition: 'background-color 0.15s'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Utility Actions */}
      <div style={{ 
        marginTop: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        alignItems: isExpanded ? 'stretch' : 'center', 
        width: '100%',
        position: 'relative',
        paddingTop: '16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingLeft: isExpanded ? '12px' : '0',
        paddingRight: isExpanded ? '12px' : '0'
      }}>
        {/* Theme Toggle Button */}
        <div style={{ display: 'flex', justifyContent: isExpanded ? 'space-between' : 'center', alignItems: 'center', width: '100%' }}>
          {isExpanded && <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.45)' }}>Theme Mode</span>}
          <button 
            id="admin-theme-toggle"
            onClick={(e) => { e.stopPropagation(); setShowThemePanel(!showThemePanel); setShowUserMenu(false); }} 
            title="Theme Options"
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer', 
              color: 'rgba(255, 255, 255, 0.65)', 
              padding: '8px', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s, color 0.2s',
              outline: 'none',
              width: '40px',
              height: '40px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
            }}
          >
            {theme === 'dark' ? <IconMoon /> : (theme === 'light' ? <IconSun /> : <IconMonitor />)}
          </button>
        </div>

        {/* Floating Side Theme Configuration Swatches */}
        {showThemePanel && (
          <div 
            id="admin-theme-panel"
            className="card"
            style={{ 
              position: 'absolute', 
              left: isExpanded ? '240px' : '60px', 
              bottom: '48px', 
              width: '240px', 
              zIndex: 99999, 
              padding: '20px',
              backgroundColor: theme === 'light' ? 'var(--accent, #7c3aed)' : '#16161c',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg), 0 15px 30px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', textAlign: 'left' }}>Appearance</div>
            <div className="theme-mode-toggle" style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button 
                type="button"
                className={`theme-mode-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setAppTheme('light')}
                style={{ flex: 1, padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <IconSun /> Light
              </button>
              <button 
                type="button"
                className={`theme-mode-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setAppTheme('dark')}
                style={{ flex: 1, padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <IconMoon /> Dark
              </button>
              <button 
                type="button"
                className={`theme-mode-option ${theme === 'system' ? 'active' : ''}`}
                onClick={() => setAppTheme('system')}
                style={{ flex: 1, padding: '8px', fontSize: '11px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
              >
                <IconMonitor /> System
              </button>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: 'white', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', textAlign: 'left' }}>Accent color</div>
            <div className="accent-swatches" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
              {accents.map((a) => (
                <button
                  key={a}
                  className={`accent-swatch accent-swatch-${a} ${accent === a ? "active" : ""}`}
                  title={a.charAt(0).toUpperCase() + a.slice(1)}
                  aria-label={`Set accent color to ${a}`}
                  onClick={() => setAppAccent(a)}
                  style={{ width: '20px', height: '20px' }}
                ></button>
              ))}
            </div>
          </div>
        )}

        {/* User Avatar & Menu */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: isExpanded ? 'stretch' : 'center' }}>
          <button 
            id="admin-user-toggle"
            onClick={(e) => { e.stopPropagation(); setShowUserMenu(!showUserMenu); setShowThemePanel(false); }}
            style={{ 
              width: isExpanded ? '100%' : '48px',
              height: isExpanded ? 'auto' : '48px',
              borderRadius: isExpanded ? '12px' : '16px', 
              background: isExpanded ? 'rgba(255,255,255,0.04)' : 'transparent', 
              display: 'flex', 
              alignItems: 'center',
              gap: '12px',
              border: 'none', 
              cursor: 'pointer', 
              padding: isExpanded ? '10px 12px' : '0',
              justifyContent: isExpanded ? 'flex-start' : 'center',
              outline: 'none',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => { if (isExpanded) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'; }}
            onMouseLeave={(e) => { if (isExpanded) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'; }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
              <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'left' }}>Admin User</span>
                <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.45)' }}>Administrator</span>
              </div>
            )}
          </button>

          {showUserMenu && (
            <div 
              id="admin-user-menu"
              className="card"
              style={{
                position: 'absolute',
                left: isExpanded ? '240px' : '60px',
                bottom: '0px',
                width: '240px',
                zIndex: 99999,
                padding: '8px',
                backgroundColor: theme === 'light' ? 'var(--accent, #7c3aed)' : '#16161c',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg), 0 15px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '8px', paddingBottom: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
                  <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>Admin User</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)' }}>Administrator</span>
                </div>
              </div>

              <Link href="/admin/account" onClick={() => setShowUserMenu(false)} style={{ padding: '8px 12px', fontSize: '13px', color: 'white', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Account Settings
              </Link>
              <Link href="/admin/account/recent-devices" onClick={() => setShowUserMenu(false)} style={{ padding: '8px 12px', fontSize: '13px', color: 'white', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                Device Management
              </Link>
              
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)', margin: '4px 0' }}></div>
              
              <button 
                onClick={() => { setShowUserMenu(false); handleSignOut(); }}
                style={{ padding: '8px 12px', fontSize: '13px', color: 'white', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }} 
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'} 
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
