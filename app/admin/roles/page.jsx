import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AdminRolesPage() {
  const session = await auth()
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (user?.role !== "ADMIN") {
    return <div className="card" style={{ padding: "32px" }}>Access Denied: Enterprise Admin only.</div>
  }

  // Optimistic Mock Data for UI
  const roles = [
    { id: 1, name: "Super Administrator", users: 1, color: "var(--danger)" },
    { id: 2, name: "Content Manager", users: 4, color: "var(--primary)" },
    { id: 3, name: "Community Moderator", users: 12, color: "orange" },
    { id: 4, name: "Support Agent", users: 8, color: "teal" }
  ]

  const permissionsList = [
    "Manage Users", "Ban Users", "Delete Content", "View Revenue", "Manage Ads", "Change Algorithms", "System Settings"
  ]

  return (
    <div className="card" style={{ padding: "32px", animation: "fade-in 0.3s ease-out" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        <h2 style={{ fontSize: "20px", margin: 0 }}>Roles & Permissions</h2>
        <button className="btn btn-primary btn-sm"><i className="ti ti-plus"></i> Create Role</button>
      </div>

      <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
        Granularly manage access levels across the platform. Assign specific capabilities to custom roles.
      </p>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <h3 style={{ fontSize: "14px", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "16px" }}>Active Roles</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {roles.map(role => (
              <div key={role.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-tertiary)", cursor: "pointer", transition: "transform 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: role.color }}></div>
                  <span style={{ fontWeight: "600" }}>{role.name}</span>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)", backgroundColor: "var(--bg-card)", padding: "4px 8px", borderRadius: "100px" }}>
                  {role.users} Users
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: "2 1 400px", backgroundColor: "var(--bg-secondary)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-tertiary)" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Role Editor: Community Moderator</h3>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "24px" }}>Select specific permissions for this role.</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {permissionsList.map((perm, i) => (
              <label key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                <input type="checkbox" defaultChecked={["Ban Users", "Delete Content"].includes(perm)} style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }} />
                {perm}
              </label>
            ))}
          </div>

          <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            <button className="btn btn-ghost">Cancel</button>
            <button className="btn btn-primary">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  )
}
