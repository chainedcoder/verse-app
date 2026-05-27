import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import PreferencesClient from "@/components/PreferencesClient"

export const metadata = {
  title: "Preferences | Verse"
}

export default async function PreferencesPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "8px" }}>App Preferences</h2>
      <p style={{ color: "var(--text-tertiary)", fontSize: "14px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Customize your experience on Verse.
      </p>
      <PreferencesClient user={user} />
    </div>
  )
}
