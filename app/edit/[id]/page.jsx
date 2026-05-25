import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import PoemEditor from "@/components/PoemEditor"

export default async function EditPoemPage(props) {
  const params = await props.params
  const poemId = params.id
  
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  const poem = await prisma.poem.findUnique({
    where: { id: poemId },
    include: {
      tags: true
    }
  })

  if (!poem || poem.authorId !== session.user.id) {
    redirect("/")
  }

  const allTags = await prisma.tag.findMany({ select: { name: true } })

  return (
    <div className="container" style={{ padding: "40px 0", maxWidth: "700px" }}>
      <h1 className="serif" style={{ fontSize: "36px", marginBottom: "32px", letterSpacing: "-0.5px" }}>Edit Poem</h1>
      <PoemEditor initialPoem={poem} allTags={allTags.map(t => t.name)} />
    </div>
  )
}
