import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminRevenuePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const subscriptions = [
    { tier: "Verse Basic", price: "$0/mo", users: "12,450", features: "Standard Feed, 5 posts/day" },
    { tier: "Verse Pro", price: "$5/mo", users: "840", features: "Ad-free, Unlimited posts, Analytics" },
    { tier: "Verse Enterprise", price: "$49/mo", users: "12", features: "API access, Custom themes, Priority support" },
  ]

  return (
    <div className="card" style={{ padding: "32px", animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        <h2 style={{ fontSize: "20px", margin: 0 }}>Monetization & Revenue</h2>
        <button className="btn btn-ghost btn-sm"><i className="ti ti-download"></i> Export CSV</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", marginBottom: "32px" }}>
        <div style={{ padding: "32px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Monthly Recurring Revenue (MRR)</div>
          <div style={{ fontSize: "48px", fontWeight: "700", color: "var(--primary)" }}>$4,788</div>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "8px" }}>+5.2% from last month</div>
        </div>

        <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "12px", padding: "24px", border: "1px solid var(--border-tertiary)", position: "relative" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 600 }}>REVENUE GROWTH (YTD)</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "150px" }}>
            {[30, 45, 40, 60, 55, 75, 80, 70, 90, 85, 95, 100].map((val, i) => (
              <div key={i} style={{ flex: 1, backgroundColor: "var(--primary)", height: `${val}%`, borderRadius: "4px 4px 0 0", opacity: i === 11 ? 1 : 0.6 }}></div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", fontSize: "10px", color: "var(--text-tertiary)" }}>
            <span>JAN</span>
            <span>DEC</span>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Subscription Tiers</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-secondary)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "12px 8px" }}>Tier</th>
              <th style={{ padding: "12px 8px" }}>Price</th>
              <th style={{ padding: "12px 8px" }}>Active Subscribers</th>
              <th style={{ padding: "12px 8px" }}>Key Features</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-tertiary)" }}>
                <td style={{ padding: "12px 8px", fontWeight: 600 }}>{sub.tier}</td>
                <td style={{ padding: "12px 8px", color: "var(--primary)", fontWeight: 600 }}>{sub.price}</td>
                <td style={{ padding: "12px 8px" }}>{sub.users}</td>
                <td style={{ padding: "12px 8px", fontSize: "12px", color: "var(--text-secondary)" }}>{sub.features}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
