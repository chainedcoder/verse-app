"use client"

import { useState, useTransition } from "react"
import { updateAccountSettings } from "@/app/actions/profile"
import { useRouter } from "next/navigation"

export default function AccountSettingsClient({ user }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    
    const formData = new FormData(e.target)
    
    // Add missing checkboxes if they are unchecked
    if (!formData.get("isPrivateAccount")) formData.set("isPrivateAccount", "false")
    if (!formData.get("mfaEnabled")) formData.set("mfaEnabled", "false")
    if (!formData.get("emailNotifications")) formData.set("emailNotifications", "false")

    startTransition(async () => {
      const result = await updateAccountSettings(formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
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
          <i className="ti ti-check"></i> Settings updated successfully
        </div>
      )}

      <div className="form-group">
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="isPrivateAccount" 
            value="true" 
            defaultChecked={user.isPrivateAccount}
            style={{ marginTop: "4px", width: "16px", height: "16px", accentColor: "var(--primary)" }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: "15px", marginBottom: "4px" }}>Private Account</div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              When your account is private, only people you approve can see your profile and poems.
            </div>
          </div>
        </label>
      </div>

      <div className="form-group">
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="emailNotifications" 
            value="true" 
            defaultChecked={user.emailNotifications}
            style={{ marginTop: "4px", width: "16px", height: "16px", accentColor: "var(--primary)" }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: "15px", marginBottom: "4px" }}>Email Notifications</div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Receive emails when someone likes or comments on your poems, or starts following you.
            </div>
          </div>
        </label>
      </div>

      <div className="form-group" style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border-secondary)" }}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: "12px", cursor: "pointer" }}>
          <input 
            type="checkbox" 
            name="mfaEnabled" 
            value="true" 
            defaultChecked={user.mfaEnabled}
            style={{ marginTop: "4px", width: "16px", height: "16px", accentColor: "var(--primary)" }}
          />
          <div>
            <div style={{ fontWeight: 500, fontSize: "15px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="ti ti-shield-check" style={{ color: "var(--primary)" }}></i>
              Two-Factor Authentication (2FA)
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
              Add an extra layer of security to your account. You'll be asked for a verification code when logging in from a new device.
              <br/><br/>
              <em>Note: This is currently a mock setting to demonstrate UI capability.</em>
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
            <><i className="ti ti-device-floppy"></i> Save Settings</>
          )}
        </button>
      </div>
    </form>
  )
}
