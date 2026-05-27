"use client"

import { useTransition } from "react"
import { revokeSession } from "@/app/actions/sessions"
import { useRouter } from "next/navigation"

export default function SessionsClient({ sessions, currentSessionToken }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRevoke = (sessionId) => {
    startTransition(async () => {
      await revokeSession(sessionId)
      router.refresh()
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {sessions.length === 0 ? (
        <div style={{ fontSize: "14px", color: "var(--text-tertiary)" }}>No active sessions found.</div>
      ) : (
        sessions.map(s => {
          const isCurrent = s.sessionToken === currentSessionToken
          return (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", backgroundColor: "var(--bg-secondary)", borderRadius: "8px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                  <i className="ti ti-device-desktop" style={{ fontSize: "20px", color: "var(--text-secondary)" }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }}>
                    Web Browser
                    {isCurrent && <span style={{ fontSize: "11px", backgroundColor: "var(--primary)", color: "white", padding: "2px 6px", borderRadius: "10px" }}>Current</span>}
                  </div>
                  <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                    Expires: {new Date(s.expires).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {!isCurrent && (
                <button 
                  onClick={() => handleRevoke(s.id)}
                  disabled={isPending}
                  className="btn btn-outline" 
                  style={{ color: "var(--error)", borderColor: "rgba(239, 68, 68, 0.2)", padding: "6px 12px", fontSize: "13px" }}
                >
                  Revoke
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
