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
    <div className="card" style={{ padding: "32px", animation: "fade-in 0.3s ease-out" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Moderation Hub
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        
        {/* Blacklists Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px" }}>Global Blacklists</h3>
            <button className="btn btn-ghost btn-sm">Add Word</button>
          </div>
          <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-tertiary)", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-tertiary)", fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
              BANNED WORDS
            </div>
            <div style={{ padding: "16px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {blacklistedWords.map((word, i) => (
                <span key={i} style={{ padding: "4px 12px", backgroundColor: "var(--bg-card)", border: "1px solid var(--danger)", color: "var(--danger)", borderRadius: "100px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {word} <i className="ti ti-x" style={{ cursor: "pointer", opacity: 0.7 }}></i>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Auto-Mod Section */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px" }}>Automated Rules</h3>
            <button className="btn btn-ghost btn-sm">Create Rule</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {autoModRules.map((rule, i) => (
              <div key={i} style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-tertiary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>{rule.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>If {rule.condition} &rarr; <strong>{rule.action}</strong></div>
                </div>
                <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                  <input type="checkbox" defaultChecked={rule.active} style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }} />
                </label>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
