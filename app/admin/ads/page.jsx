import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminAdsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const campaigns = [
    { name: "Summer Poetry Slam", status: "Active", impressions: "1.2M", clicks: "45K", spend: "$1,200" },
    { name: "Creative Writing Masterclass", status: "Active", impressions: "800K", clicks: "30K", spend: "$850" },
    { name: "Indie Publisher Promo", status: "Paused", impressions: "450K", clicks: "12K", spend: "$400" },
  ]

  return (
    <div className="card" style={{ padding: "32px", animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        <h2 style={{ fontSize: "20px", margin: 0 }}>Ads & Campaigns</h2>
        <button className="btn btn-primary btn-sm"><i className="ti ti-plus"></i> New Campaign</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Total Impressions</div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>2.45M</div>
          <div style={{ fontSize: "12px", color: "var(--primary)", marginTop: "4px" }}><i className="ti ti-arrow-up"></i> 12% this week</div>
        </div>
        <div style={{ padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Avg CTR</div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>3.8%</div>
        </div>
        <div style={{ padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Active Spend</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: "var(--primary)" }}>$2,450</div>
        </div>
      </div>

      <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Active Campaigns</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-secondary)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "12px 8px" }}>Campaign</th>
              <th style={{ padding: "12px 8px" }}>Status</th>
              <th style={{ padding: "12px 8px" }}>Impressions</th>
              <th style={{ padding: "12px 8px" }}>Clicks</th>
              <th style={{ padding: "12px 8px" }}>Spend</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border-tertiary)" }}>
                <td style={{ padding: "12px 8px", fontWeight: 600 }}>{camp.name}</td>
                <td style={{ padding: "12px 8px" }}>
                  <span style={{ fontSize: "11px", padding: "2px 6px", borderRadius: "4px", backgroundColor: camp.status === "Active" ? "var(--primary)" : "var(--bg-secondary)", color: camp.status === "Active" ? "var(--bg-primary)" : "inherit" }}>
                    {camp.status}
                  </span>
                </td>
                <td style={{ padding: "12px 8px" }}>{camp.impressions}</td>
                <td style={{ padding: "12px 8px" }}>{camp.clicks}</td>
                <td style={{ padding: "12px 8px" }}>{camp.spend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
