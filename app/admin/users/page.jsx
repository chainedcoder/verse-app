import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AdminUsersClient from "@/components/AdminUsersClient"

export default async function AdminUsersPage() {
  const session = await auth()
  
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  // Fetch all users except the current one
  const users = await prisma.user.findMany({
    where: { id: { not: session.user.id } },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      createdAt: true,
      _count: { select: { poems: true, reportsReceived: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        User Management
      </h2>
      <AdminUsersClient initialUsers={JSON.parse(JSON.stringify(users || []))} currentUserRole={currentUser.role} />
    </div>
  )
}
