"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAnonShare } from "@/app/actions/poems"

export default function QuickSharePage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await createAnonShare({
        title,
        fullText: content,
        customAuthorName: authorName
      })
      
      if (res.poemId) {
        router.push(`/export/${res.poemId}?template=siteview`)
      }
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "32px", marginBottom: "8px" }}>Quick Share</h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Generate a beautiful layout to share instantly, without logging in or saving to your profile.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div className="form-group">
          <label className="label">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="E.g., Whispers of the Wind" 
            className="input" 
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Poem Body</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            placeholder="Write your poem here..." 
            className="input" 
            style={{ minHeight: "200px", resize: "vertical", fontFamily: "inherit" }}
            required
          />
        </div>

        <div className="form-group">
          <label className="label">Author Name (Optional)</label>
          <input 
            type="text" 
            value={authorName} 
            onChange={(e) => setAuthorName(e.target.value)} 
            placeholder="E.g., Jane Doe" 
            className="input" 
            maxLength={50}
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isSubmitting || !content.trim() || !title.trim()}
          style={{ marginTop: "12px", padding: "12px", fontSize: "16px" }}
        >
          {isSubmitting ? "Preparing Layouts..." : "Continue to Layouts"}
        </button>
      </form>
    </div>
  )
}
