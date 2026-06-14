import { prisma } from "@/lib/prisma"
import Link from "next/link"
import ExportPageClient from "@/components/ExportPageClient"

export default async function ExportPage(props) {
  const params = await props.params
  const poemId = params.id

  const poem = await prisma.poem.findUnique({
    where: { id: poemId },
    include: {
      author: true
    }
  })

  if (!poem) {
    return (
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <h2 style={{ marginBottom: "8px" }}>Poem not found</h2>
        <Link href="/" className="btn btn-primary">Back to feed</Link>
      </div>
    )
  }

  const safePoem = JSON.parse(JSON.stringify(poem))
  return <ExportPageClient poem={safePoem} author={safePoem.author} />
}
