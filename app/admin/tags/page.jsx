import { fetchTagsAdmin } from "@/app/actions/admin"
import AdminTagsClient from "@/components/AdminTagsClient"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function AdminTagsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  const { tags, error } = await fetchTagsAdmin()

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Tag Management
      </h2>
      
      {error ? (
        <div className="form-error">{error}</div>
      ) : (
        <AdminTagsClient initialTags={JSON.parse(JSON.stringify(tags || []))} currentUserRole={user.role} />
      )}
    </div>
  )
}
