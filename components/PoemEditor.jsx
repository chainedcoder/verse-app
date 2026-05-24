"use client"

import { useState, useTransition } from "react"
import { createPoem } from "@/app/actions/poems"

export default function PoemEditor() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.target)

    startTransition(async () => {
      const result = await createPoem(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form className="poem-editor-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {error && (
        <div style={{ padding: "12px", backgroundColor: "#ffebee", color: "#c62828", borderRadius: "8px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Title</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          className="input" 
          placeholder="A beautiful title"
          required 
          style={{ fontSize: "20px", padding: "12px 16px" }}
        />
      </div>

      <div>
        <label htmlFor="excerpt" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
          Excerpt <span style={{ color: "var(--text-tertiary)", fontWeight: "normal" }}>(Optional - auto-generated from body)</span>
        </label>
        <textarea 
          id="excerpt" 
          name="excerpt" 
          className="input" 
          placeholder="A short preview of the poem..."
          rows={2}
          style={{ resize: "vertical" }}
        />
      </div>

      <div>
        <label htmlFor="fullText" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>Body</label>
        <textarea 
          id="fullText" 
          name="fullText" 
          className="input serif" 
          placeholder="Write your poem here..."
          required 
          rows={15}
          style={{ fontSize: "18px", lineHeight: "1.6", resize: "vertical" }}
        />
      </div>

      <div>
        <label htmlFor="tags" style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
          Tags <span style={{ color: "var(--text-tertiary)", fontWeight: "normal" }}>(Comma-separated)</span>
        </label>
        <input 
          type="text" 
          id="tags" 
          name="tags" 
          className="input" 
          placeholder="nature, classic, love"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isPending}
        >
          {isPending ? "Publishing..." : "Publish"}
        </button>
      </div>
    </form>
  )
}
