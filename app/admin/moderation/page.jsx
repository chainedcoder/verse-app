import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminModerationPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const blacklistedWords = ["spam", "buy now", "click here", "crypto", "gambling"]
  const autoModRules = [
    { name: "Spam Filter", condition: "Contains > 3 blacklisted words", action: "Flag for Review", active: true },
    { name: "Toxicity Filter", condition: "AI Sentiment < 0.2", action: "Auto-Suspend", active: false },
    { name: "New User Limits", condition: "Age < 24h & > 5 posts", action: "Shadowban", active: true },
  ]

  return (
    <main className="admin-main">

      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Moderation</h1>
          <p className="admin-page-subtitle">Configure auto-moderation filters and manage content policies.</p>
        </div>
        <div className="admin-page-actions">
          <button className="btn btn-ghost btn-sm">Export Log</button>
        </div>
      </div>

      <div className="moderation-grid">
        
        {/* Blacklists Section */}
        <div className="card">
          <div className="moderation-section-header">
            <h3 className="moderation-section-title">Global Blacklists</h3>
            <button className="btn btn-ghost btn-sm">+ Add Word</button>
          </div>
          <div className="moderation-words-container">
            <div className="moderation-words-header">Banned Words</div>
            <div className="moderation-words-body">
              {blacklistedWords.map((word, i) => (
                <span key={i} className="moderation-word-tag">
                  {word}
                  <i className="ti ti-x" style={{ cursor: "pointer", opacity: 0.6, fontSize: '12px' }} />
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Mod Section */}
        <div className="card">
          <div className="moderation-section-header">
            <h3 className="moderation-section-title">Automated Rules</h3>
            <button className="btn btn-ghost btn-sm">+ Create Rule</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {autoModRules.map((rule, i) => (
              <div key={i} className="moderation-rule-item">
                <div>
                  <div className="moderation-rule-name">{rule.name}</div>
                  <div className="moderation-rule-desc">If {rule.condition} → {rule.action}</div>
                </div>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    defaultChecked={rule.active}
                    style={{ accentColor: "var(--accent)", width: "16px", height: "16px" }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
