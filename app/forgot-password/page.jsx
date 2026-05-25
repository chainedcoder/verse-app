"use client"

import { useState } from "react"
import { requestPasswordReset } from "@/app/actions/auth"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setStatus("loading")
    setErrorMessage("")

    const result = await requestPasswordReset(email)

    if (result.success) {
      setStatus("success")
    } else {
      setStatus("error")
      setErrorMessage(result.error)
    }
  }

  return (
    <div className="container" style={{ padding: "60px 0", maxWidth: "400px" }}>
      <div className="card">
        <h1 className="serif" style={{ fontSize: "28px", marginBottom: "8px" }}>Reset Password</h1>
        
        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--primary)", fontSize: "48px", marginBottom: "16px" }}>
              <i className="ti ti-mail-check" aria-hidden="true"></i>
            </div>
            <p style={{ color: "var(--text-primary)", marginBottom: "16px", fontSize: "14px", lineHeight: "1.5" }}>
              If an account exists with <strong>{email}</strong>, we have sent a password reset link.
            </p>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "13px", lineHeight: "1.5" }}>
              Please check your console output since this is local development.
            </p>
            <Link href="/login" className="btn btn-primary btn-full">
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "14px", lineHeight: "1.5" }}>
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>

            {status === "error" && (
              <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>Email address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                  required 
                  disabled={status === "loading"}
                />
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary btn-full" 
                style={{ marginTop: "8px" }}
                disabled={status === "loading"}
              >
                {status === "loading" ? "Sending link..." : "Send Reset Link"}
              </button>
            </form>

            <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
              Remember your password? <Link href="/login" style={{ color: "var(--accent)", fontWeight: "500" }}>Log in</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
