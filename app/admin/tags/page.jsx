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
    <main className="admin-main">
      <div className="max-w-full space-y-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <h2 className="serif text-3xl font-bold" style={{ margin: 0, color: 'var(--text-primary)' }}>Tag Management</h2>
            <p className="text-sm text-gray-500" style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Organize and curate content discovery tags.</p>
          </div>
        </div>

        <div>
          
          {error ? (
            <div className="form-error">{error}</div>
          ) : (
            <AdminTagsClient initialTags={JSON.parse(JSON.stringify(tags || []))} currentUserRole={user.role} />
          )}
        </div>
      </div>
    </main>
  )
}
