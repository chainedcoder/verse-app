import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import PoemEditor from "@/components/PoemEditor"

export const metadata = {
  title: "Write | Verse",
  description: "Create and publish a new poem."
}

export default async function WritePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const allTags = await prisma.tag.findMany({ select: { name: true } })

  return (
    <div className="write-page container">
      <h1 className="poem-viewer-title serif" style={{ marginBottom: "32px" }}>Write</h1>
      <PoemEditor allTags={allTags.map(t => t.name)} />
    </div>
  )
}
