import { fetchAllPoems } from "@/app/actions/admin"
import AdminContentClient from "@/components/AdminContentClient"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export default async function AdminContentPage() {
  const session = await auth()
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const { poems, error } = await fetchAllPoems()

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Content Management
      </h2>
      
      {error ? (
        <div className="form-error">{error}</div>
      ) : (
        <AdminContentClient initialPoems={JSON.parse(JSON.stringify(poems || []))} currentUserRole={user.role} />
      )}
    </div>
  )
}
