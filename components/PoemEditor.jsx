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
    <form className="poem-editor-form" onSubmit={handleSubmit}>
      {error && (
        <div className="form-error">
          <i className="ti ti-alert-circle"></i> {error}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="title" className="form-label">Title</label>
        <input 
          type="text" 
          id="title" 
          name="title" 
          className="input serif" 
          placeholder="A beautiful title"
          required 
          style={{ fontSize: "24px", padding: "16px 20px" }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="excerpt" className="form-label">
          Excerpt <span className="form-hint">(Optional - auto-generated from body)</span>
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

      <div className="form-group">
        <label htmlFor="fullText" className="form-label">Body</label>
        <textarea 
          id="fullText" 
          name="fullText" 
          className="input serif" 
          placeholder="Write your poem here..."
          required 
          rows={15}
          style={{ fontSize: "18px", lineHeight: "1.8", resize: "vertical" }}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tags" className="form-label">
          Tags <span className="form-hint">(Comma-separated)</span>
        </label>
        <input 
          type="text" 
          id="tags" 
          name="tags" 
          className="input" 
          placeholder="nature, classic, love"
        />
      </div>

      <div className="form-actions">
        <button 
          type="submit" 
          className="btn btn-primary btn-lg" 
          disabled={isPending}
        >
          {isPending ? (
            <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }}></i> Publishing...</>
          ) : (
            <><i className="ti ti-send"></i> Publish</>
          )}
        </button>
      </div>
    </form>
  )
}
