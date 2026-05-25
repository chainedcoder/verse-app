"use client"

import { useState, useTransition, useRef } from "react"
import { updateProfile } from "@/app/actions/profile"
import { useRouter } from "next/navigation"

export default function ProfileEditor({ user }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState(user.image || null)
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB")
        return
      }
      const url = URL.createObjectURL(file)
      setPreviewImage(url)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.target)

    startTransition(async () => {
      const result = await updateProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        router.refresh() // Refresh to reflect new session data if needed
      }
    })
  }

  return (
    <form className="profile-editor-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {error && (
        <div className="form-error">
          <i className="ti ti-alert-circle"></i> {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="ti ti-check"></i> Profile updated successfully
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "16px" }}>
        <div 
          className="avatar avatar-xl avatar-warm" 
          style={{ 
            width: "120px", height: "120px", fontSize: "36px", 
            marginBottom: "16px", cursor: "pointer", position: "relative",
            overflow: "hidden"
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewImage ? (
            <img src={previewImage} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            user.name ? user.name.match(/\b\w/g)?.join('').substring(0, 2).toUpperCase() : '?'
          )}
          <div style={{ 
            position: "absolute", bottom: 0, left: 0, right: 0, 
            backgroundColor: "rgba(0,0,0,0.5)", color: "white", 
            fontSize: "12px", textAlign: "center", padding: "4px 0",
            display: "flex", justifyContent: "center", alignItems: "center", gap: "4px"
          }}>
            <i className="ti ti-camera"></i> Change
          </div>
        </div>
        <input 
          type="file" 
          name="avatar" 
          accept="image/*" 
          ref={fileInputRef} 
          style={{ display: "none" }} 
          onChange={handleImageChange}
        />
        <p style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>JPG, PNG, GIF up to 5MB</p>
      </div>

      <div className="form-group">
        <label htmlFor="name" className="form-label">Display Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          className="input" 
          defaultValue={user.name || ""}
          placeholder="Your full name or pen name"
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="location" className="form-label">Location</label>
        <input 
          type="text" 
          id="location" 
          name="location" 
          className="input" 
          defaultValue={user.location || ""}
          placeholder="e.g. New York, USA"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bio" className="form-label">Bio</label>
        <textarea 
          id="bio" 
          name="bio" 
          className="input" 
          defaultValue={user.bio || ""}
          placeholder="Tell readers about yourself..."
          rows={4}
          style={{ resize: "vertical" }}
        />
      </div>

      <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end" }}>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isPending}
        >
          {isPending ? (
            <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }}></i> Saving...</>
          ) : (
            <><i className="ti ti-device-floppy"></i> Save Profile</>
          )}
        </button>
      </div>
    </form>
  )
}
