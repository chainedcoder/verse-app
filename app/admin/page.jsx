import { fetchPendingReports } from "@/app/actions/admin"
import AdminReportsClient from "@/components/AdminReportsClient"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminReportsPage() {
  const session = await auth()
  
  // Need to pass the role so the client knows if it's ADMIN or MODERATOR
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const { reports, error } = await fetchPendingReports()

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Pending Reports
      </h2>
      
      {error ? (
        <div className="form-error">{error}</div>
      ) : (
        <AdminReportsClient initialReports={reports} currentUserRole={user.role} />
      )}
    </div>
  )
}
