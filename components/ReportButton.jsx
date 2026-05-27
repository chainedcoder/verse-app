"use client"

import { useState, useTransition } from "react"
import { submitReport } from "@/app/actions/reports"
import { useSession } from "next-auth/react"

export default function ReportButton({ type, targetId, buttonStyle = "ghost", className = "" }) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  if (!session?.user) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    
    if (reason.trim().length < 5) {
      setError("Please provide a valid reason (at least 5 characters).")
      return
    }

    startTransition(async () => {
      const res = await submitReport({ type, targetId, reason })
      if (res.success) {
        setSuccess(true)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess(false)
          setReason("")
        }, 3000)
      } else {
        setError(res.error)
      }
    })
  }

  const getTargetName = () => {
    if (type === "POEM") return "Poem"
    if (type === "USER") return "User"
    if (type === "COMMENT") return "Comment"
    return "Content"
  }

  return (
    <>
      <button 
        className={`btn btn-${buttonStyle} btn-sm ${className}`} 
        onClick={() => setIsOpen(true)}
        title={`Report this ${getTargetName().toLowerCase()}`}
      >
        <i className="ti ti-flag"></i> {buttonStyle !== "icon-only" && <span>Report</span>}
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div className="card" style={{ width: "100%", maxWidth: "400px", padding: "24px" }}>
            <h3 style={{ marginTop: 0, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="ti ti-flag" style={{ color: "var(--danger)" }}></i> Report {getTargetName()}
            </h3>
            
            {success ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ color: "var(--success)", fontSize: "48px", marginBottom: "16px" }}>
                  <i className="ti ti-circle-check"></i>
                </div>
                <h4 style={{ margin: "0 0 8px 0" }}>Report Submitted</h4>
                <p style={{ margin: 0, color: "var(--text-secondary)" }}>
                  Thank you for keeping Verse safe. Our moderators will review this shortly.
                </p>
                <button className="btn btn-ghost" style={{ marginTop: "24px", width: "100%" }} onClick={() => setIsOpen(false)}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="reason" style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "14px" }}>
                    Why are you reporting this {getTargetName().toLowerCase()}?
                  </label>
                  <textarea 
                    id="reason"
                    className="input" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide details..."
                    style={{ width: "100%", minHeight: "100px", resize: "vertical" }}
                    autoFocus
                  />
                </div>
                
                {error && <div className="form-error" style={{ marginBottom: "16px" }}>{error}</div>}
                
                <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsOpen(false)} disabled={isPending}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" style={{ backgroundColor: "var(--danger)", borderColor: "var(--danger)" }} disabled={isPending}>
                    {isPending ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
