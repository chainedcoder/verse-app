import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SessionsClient from "@/components/SessionsClient"

export const metadata = {
  title: "Active Sessions | Verse"
}

export default async function SessionsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const sessions = await prisma.session.findMany({
    where: { userId: session.user.id },
    orderBy: { expires: 'desc' }
  })

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>Active Sessions</h2>
      <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        These are the devices that have logged into your account. Revoke any sessions that you do not recognize.
      </p>
      <SessionsClient sessions={sessions} currentSessionToken={session.sessionToken} />
    </div>
  )
}
