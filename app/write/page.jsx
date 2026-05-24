import { auth } from "@/auth"
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

  return (
    <div className="container" style={{ padding: "40px 0", maxWidth: "800px", margin: "0 auto" }}>
      <h1 className="serif" style={{ fontSize: "36px", marginBottom: "24px" }}>Write</h1>
      <PoemEditor />
    </div>
  )
}
