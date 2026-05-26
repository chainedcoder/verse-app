import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"

export async function generateMetadata(props) {
  const params = await props.params
  const poem = await prisma.poem.findUnique({
    where: { id: params.id, status: { not: "DELETED" }, isPrivate: false },
    select: { title: true, author: { select: { name: true } } }
  })
  if (!poem) return { title: "Poem not found" }
  return { title: `${poem.title} — Verse` }
}

export default async function PoemEmbedPage(props) {
  const params = await props.params

  const poem = await prisma.poem.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true } },
      tags: { select: { name: true } }
    }
  })

  if (!poem || poem.status === "DELETED" || poem.isPrivate) {
    notFound()
  }

  const originUrl = process.env.NEXTAUTH_URL || "https://verse.app"

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { padding: 24px; min-height: 100vh; display: flex; flex-direction: column; }
        .embed-card {
          background: #fff;
          border: 1px solid #e5e5e3;
          border-radius: 12px;
          padding: 28px 32px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .embed-tags { font-size: 11px; color: #888; letter-spacing: 0.06em; text-transform: uppercase; }
        .embed-title { font-family: 'Playfair Display', serif; font-size: clamp(20px, 5vw, 28px); font-weight: 700; line-height: 1.25; color: #111; }
        .embed-body { font-family: 'Playfair Display', serif; font-style: italic; font-size: 15px; line-height: 1.9; color: #444; flex: 1; }
        .embed-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid #e5e5e3; }
        .embed-author { font-size: 13px; color: #666; }
        .embed-author strong { color: #111; font-weight: 500; }
        .embed-link { font-size: 11px; color: #888; text-decoration: none; }
        .embed-link:hover { color: #6366f1; }
        .verse-logo { font-size: 11px; font-weight: 600; letter-spacing: 0.08em; color: #6366f1; }
      `}</style>

      <div className="embed-card">
        {poem.tags.length > 0 && (
          <div className="embed-tags">
            {poem.tags.slice(0, 3).map(t => t.name).join(" · ")}
          </div>
        )}
        <h1 className="embed-title">{poem.title}</h1>
        <div
          className="embed-body"
          dangerouslySetInnerHTML={{ __html: poem.fullText.replace(/\n/g, "<br>") }}
        />
        <footer className="embed-footer">
          <div className="embed-author">
            by <strong>{poem.author.name}</strong>
          </div>
          <Link
            href={`${originUrl}/poem/${poem.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="embed-link"
          >
            <span className="verse-logo">verse</span>
          </Link>
        </footer>
      </div>
    </>
  )
}
