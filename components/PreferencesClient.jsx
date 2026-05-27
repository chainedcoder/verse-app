"use client"

import { useState, useTransition } from "react"
import { updatePreferences } from "@/app/actions/profile"
import { useRouter } from "next/navigation"

export default function PreferencesClient({ user }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.target)
    if (!formData.get("immersiveMode")) formData.set("immersiveMode", "false")

    startTransition(async () => {
      const result = await updatePreferences(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
        router.refresh()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {error && (
        <div className="form-error">
          <i className="ti ti-alert-circle"></i> {error}
        </div>
      )}
      
      {success && (
        <div style={{ padding: "12px 16px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="ti ti-check"></i> Preferences updated successfully
        </div>
      )}

      <div className="form-group" style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-secondary)" }}>
        <h3 style={{ fontSize: "15px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <i className="ti ti-color-swatch"></i> Theme
        </h3>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {["system", "light", "dark"].map((themeMode) => (
            <label key={themeMode} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", padding: "12px 16px", border: "1px solid var(--border)", borderRadius: "8px", flex: 1, backgroundColor: "var(--bg-card)", justifyContent: "center" }}>
              <input 
                type="radio" 
                name="theme" 
                value={themeMode} 
                defaultChecked={user.theme === themeMode || (!user.theme && themeMode === "system")}
                style={{ accentColor: "var(--primary)" }}
              />
              <span style={{ textTransform: "capitalize", fontWeight: 500 }}>{themeMode}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group" style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-secondary)" }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="immersiveMode" 
            value="true" 
            defaultChecked={user.immersiveMode}
            style={{ marginTop: "4px", width: "16px", height: "16px", accentColor: "var(--primary)" }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: "15px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-maximize"></i> Immersive Mode
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Hide sidebars and navigation when reading poems to focus purely on the content.
            </div>
          </div>
        </label>
      </div>

      <div className="form-actions" style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={isPending}
        >
          {isPending ? (
            <><i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite" }}></i> Saving...</>
          ) : (
            <><i className="ti ti-device-floppy"></i> Save Preferences</>
          )}
        </button>
      </div>
    </form>
  )
}
