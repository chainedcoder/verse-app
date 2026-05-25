"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result.error) {
      setError("Invalid email or password")
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div className="container" style={{ padding: "60px 0", maxWidth: "400px" }}>
      <div className="card">
        <h1 className="serif" style={{ fontSize: "28px", marginBottom: "8px" }}>Welcome back</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "14px" }}>
          Enter your details to sign in to your account
        </p>

        {error && (
          <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "12px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
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
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "8px" }}>
            Sign In
          </button>
        </form>

        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <hr style={{ flex: 1, borderColor: "var(--border-secondary)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>OR</span>
            <hr style={{ flex: 1, borderColor: "var(--border-secondary)" }} />
          </div>
          
          <button 
            type="button" 
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="btn btn-ghost btn-full" 
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid var(--border-secondary)" }}
          >
            <i className="ti ti-brand-github" style={{ fontSize: "18px" }}></i>
            Sign in with GitHub
          </button>

          <button 
            type="button" 
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="btn btn-ghost btn-full" 
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid var(--border-secondary)" }}
          >
            <i className="ti ti-brand-google" style={{ fontSize: "18px" }}></i>
            Sign in with Google
          </button>
        </div>

        <div style={{ marginTop: "24px", textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div>
            Forgot your password? <Link href="/forgot-password" style={{ color: "var(--accent)", fontWeight: "500" }}>Reset it</Link>
          </div>
          <div>
            Don't have an account? <Link href="/signup" style={{ color: "var(--accent)", fontWeight: "500" }}>Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
