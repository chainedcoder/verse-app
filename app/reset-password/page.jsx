"use client"

import { useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { resetPassword } from "@/app/actions/auth"
import Link from "next/link"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState("idle") // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!token) {
      setStatus("error")
      setErrorMessage("Missing reset token. Please request a new link.")
      return
    }

    if (password !== confirmPassword) {
      setStatus("error")
      setErrorMessage("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setStatus("error")
      setErrorMessage("Password must be at least 6 characters")
      return
    }

    setStatus("loading")
    setErrorMessage("")

    const result = await resetPassword(token, password)

    if (result.success) {
      setStatus("success")
    } else {
      setStatus("error")
      setErrorMessage(result.error)
    }
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "var(--success, #10b981)", fontSize: "48px", marginBottom: "16px" }}>
          <i className="ti ti-circle-check" aria-hidden="true"></i>
        </div>
        <h2 style={{ fontSize: "20px", marginBottom: "12px", color: "var(--text-primary)" }}>Password Reset Complete</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "14px", lineHeight: "1.5" }}>
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <Link href="/login" className="btn btn-primary btn-full">
          Proceed to Login
        </Link>
      </div>
    )
  }

  return (
    <>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "14px", lineHeight: "1.5" }}>
        Please enter your new password below.
      </p>

      {status === "error" && (
        <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>New Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            required 
            minLength={6}
            disabled={status === "loading"}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
            required 
            minLength={6}
            disabled={status === "loading"}
          />
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary btn-full" 
          style={{ marginTop: "8px" }}
          disabled={status === "loading" || !token}
        >
          {status === "loading" ? "Updating..." : "Update Password"}
        </button>
      </form>
    </>
  )
}

export default function ResetPassword() {
  return (
    <div className="container" style={{ padding: "60px 0", maxWidth: "400px" }}>
      <div className="card">
        <h1 className="serif" style={{ fontSize: "28px", marginBottom: "8px" }}>Set New Password</h1>
        
        <Suspense fallback={<div style={{ textAlign: "center", padding: "20px", color: "var(--text-tertiary)" }}>Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
