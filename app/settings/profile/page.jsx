import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileEditor from "@/components/ProfileEditor"

export const metadata = {
  title: "Edit Profile | Verse"
}

export default async function SettingsProfilePage() {
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
    <div className="container" style={{ padding: "40px 0", maxWidth: "600px" }}>
      <h1 className="serif" style={{ fontSize: "32px", marginBottom: "32px", letterSpacing: "-0.5px" }}>Profile Settings</h1>
      
      <div className="card" style={{ padding: "32px" }}>
        <ProfileEditor user={user} />
      </div>
    </div>
  )
}
