import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AccountSettingsClient from "@/components/AccountSettingsClient"

export const metadata = {
  title: "Account Settings | Verse"
}

export default async function AccountSettingsPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="card" style={{ padding: "32px" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>Account & Privacy</h2>
      <AccountSettingsClient user={JSON.parse(JSON.stringify(user))} />
    </div>
  )
}
