"use client"

import { useState, useTransition } from "react"
import { createPoem, updatePoem, deletePoem, restorePoem } from "@/app/actions/poems"
import { useToast } from "@/components/ToastProvider"
import { useRouter } from "next/navigation"

export default function PoemEditor({ initialPoem = null, allTags = [] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const { showUndoToast } = useToast()
  const [error, setError] = useState(null)
  const [submitAction, setSubmitAction] = useState(null)

  const isEditMode = !!initialPoem

  // Tags need to be a comma-separated string if initialPoem has tags relation
  const initialTagsStr = initialPoem?.tags ? initialPoem.tags.map(t => t.name).join(", ") : ""
  const [currentTags, setCurrentTags] = useState(initialTagsStr)
  
  // Vibe configuration for immersive mode
  const [vibeConfig, setVibeConfig] = useState(
    Array.isArray(initialPoem?.vibeConfig) ? initialPoem.vibeConfig : []
  )

  const handleVibeChange = (opt) => {
    setVibeConfig(prev => {
      if (prev.includes(opt)) return prev.filter(x => x !== opt)
      return [...prev, opt]
    })
  }

  const handleTagClick = (tag) => {
    const tagsArray = currentTags.split(',').map(t => t.trim()).filter(Boolean)
    if (!tagsArray.includes(tag)) {
      setCurrentTags(currentTags ? `${currentTags}, ${tag}` : tag)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.target)

    // Use state-based action tracking for cross-browser & test compatibility
    const actionType = submitAction || e.nativeEvent.submitter?.name
    if (actionType === "save_draft") {
      formData.set("status", "DRAFT")
    } else {
      formData.set("status", "PUBLISHED")
    }

    formData.set("vibeConfig", JSON.stringify(vibeConfig))

    startTransition(async () => {
      let result
      if (isEditMode) {
        result = await updatePoem(initialPoem.id, formData)
      } else {
        result = await createPoem(formData)
      }
      
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deletePoem(initialPoem.id)
      if (result?.error) {
        setError(result.error)
      } else {
        showUndoToast("Poem deleted", async () => {
          await restorePoem(initialPoem.id)
        })
        router.push('/')
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
          defaultValue={initialPoem?.title || ""}
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
          defaultValue={initialPoem?.excerpt || ""}
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
          defaultValue={initialPoem?.fullText || ""}
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
          value={currentTags}
          onChange={(e) => setCurrentTags(e.target.value)}
        />
        {allTags.length > 0 && (
          <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)", marginTop: "4px" }}>Suggestions:</span>
            {allTags.map(tag => (
              <span 
                key={tag} 
                className="tag" 
                style={{ cursor: "pointer", fontSize: "12px", padding: "2px 8px" }}
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="isPrivate" 
            value="true" 
            defaultChecked={initialPoem?.isPrivate || false} 
          />
          <span style={{ fontSize: "14px" }}>Keep Private (Only you can see this)</span>
        </label>
      </div>

      <div className="form-group" style={{ marginBottom: "24px" }}>
        <label htmlFor="images" className="form-label">
          Illustrations <span className="form-hint">(Optional - Upload multiple images)</span>
        </label>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "8px" }}>
          <input 
            type="file" 
            id="images" 
            name="images" 
            className="input" 
            accept="image/*"
            multiple
          />
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
            Upload images to accompany your poem. These will be displayed as a swipeable carousel.
          </p>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: "24px" }}>
        <label className="form-label">
          Immersive Layout Modules <span className="form-hint">(Optional - Select to display in Immersive Mode)</span>
        </label>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "8px" }}>
          {['related', 'illustration', 'reflection'].map(opt => (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "13px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
              <input 
                type="checkbox" 
                checked={vibeConfig.includes(opt)}
                onChange={() => handleVibeChange(opt)}
              />
              {opt.replace('-', ' ')}
            </label>
          ))}
        </div>
      </div>

      <div className="form-actions" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        {isEditMode && (
          <button 
            type="button"
            className="btn btn-ghost" 
            onClick={handleDelete}
            disabled={isPending || isDeleting}
            style={{ color: "var(--danger)" }}
          >
            <i className="ti ti-trash"></i> {isDeleting ? "Deleting..." : "Delete"}
          </button>
        )}
        
        <div style={{ display: "flex", gap: "12px", marginLeft: isEditMode ? "auto" : "0" }}>
          <button 
            type="submit" 
            name="save_draft"
            onClick={() => setSubmitAction("save_draft")}
            className="btn btn-ghost" 
            disabled={isPending}
          >
            <i className="ti ti-device-floppy"></i> Save Draft
          </button>
          
          <button 
            type="submit" 
            name="publish"
            onClick={() => setSubmitAction("publish")}
            className="btn btn-primary" 
            disabled={isPending}
          >
            {isPending && !isDeleting ? (
              <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }}></i> Saving...</>
            ) : (
              <><i className="ti ti-send"></i> {isEditMode ? "Update Poem" : "Publish"}</>
            )}
          </button>
        </div>
      </div>

    </form>
  )
}
