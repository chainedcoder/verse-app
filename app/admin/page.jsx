import { fetchDashboardMetrics } from "@/app/actions/admin"
import Link from "next/link"
import Avatar from "@/components/Avatar"

export default async function AdminDashboardPage() {
  const { metrics, recentSignups, error } = await fetchDashboardMetrics()

  if (error) {
    return <div className="card" style={{ padding: "32px" }}><div className="form-error">{error}</div></div>
  }

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Overview Dashboard
      </h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        <div style={{ padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Total Users</div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>{metrics.totalUsers}</div>
          <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>{metrics.activeUsers} active</div>
        </div>
        <div style={{ padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Total Poems</div>
          <div style={{ fontSize: "32px", fontWeight: "700" }}>{metrics.totalPoems}</div>
        </div>
        <div style={{ padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "8px" }}>Pending Reports</div>
          <div style={{ fontSize: "32px", fontWeight: "700", color: metrics.pendingReports > 0 ? "var(--danger)" : "inherit" }}>
            {metrics.pendingReports}
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Recent Signups</h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-secondary)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "12px 8px" }}>User</th>
              <th style={{ padding: "12px 8px" }}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentSignups.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--border-tertiary)" }}>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar image={user.image} name={user.name} size="sm" />
                    <div>
                      <Link href={`/author/${user.id}`} style={{ fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>{user.name}</Link>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{user.email || "No email"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {recentSignups.length === 0 && (
          <div className="empty-state" style={{ padding: "32px 0" }}>No recent signups.</div>
        )}
      </div>
    </div>
  )
}
