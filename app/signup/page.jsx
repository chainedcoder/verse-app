"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Signup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })

      if (res.ok) {
        router.push("/login")
      } else {
        const data = await res.json()
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="container" style={{ padding: "60px 0", maxWidth: "400px" }}>
      <div className="card">
        <h1 className="serif" style={{ fontSize: "28px", marginBottom: "8px" }}>Create account</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "14px" }}>
          Join Verse to discover and share poetry
        </p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              required 
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              required 
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)" }}
              required 
              minLength={6}
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "8px" }}>
            Sign Up
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent)", fontWeight: "500" }}>Log in</Link>
        </div>
      </div>
    </div>
  )
}
