import Link from "next/link"

export default function SettingsLayout({ children }) {
  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 className="serif" style={{ fontSize: "32px", marginBottom: "32px", letterSpacing: "-0.5px" }}>Settings</h1>
      
      <div style={{ display: "flex", gap: "32px", flexDirection: "row", alignItems: "flex-start" }} className="settings-layout">
        <style>{`
          @media (max-width: 768px) {
            .settings-layout {
              flex-direction: column !important;
            }
            .settings-nav {
              width: 100% !important;
              flex-direction: row !important;
              overflow-x: auto;
              padding-bottom: 8px;
            }
          }
        `}</style>
        
        <nav className="settings-nav" style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "8px", 
          width: "220px",
          flexShrink: 0
        }}>
          <Link href="/settings/profile" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-user-circle"></i> Profile
          </Link>
          <Link href="/settings/account" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-shield-lock"></i> Account & Privacy
          </Link>
          <Link href="/settings/sessions" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-devices"></i> Sessions
          </Link>
          <Link href="/settings/preferences" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-palette"></i> Preferences
          </Link>
          <Link href="/settings/support" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-headset"></i> Support & Tickets
          </Link>
        </nav>
        
        <div style={{ flex: 1, width: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
