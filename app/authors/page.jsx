"use client"
import { authors } from "@/lib/data"
import Link from "next/link"

export default function Authors() {
  return (
    <div className="container" style={{ padding: "32px 0" }}>
      <h1 className="serif" style={{ marginBottom: "24px" }}>Authors</h1>
      <div className="author-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {authors.map(author => (
          <Link key={author.id} href={`/author/${author.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card card-clickable" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div className={`avatar avatar-lg ${author.avatarClass}`}>{author.initials}</div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>{author.name}</div>
                <div style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>{author.poems} poems</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
