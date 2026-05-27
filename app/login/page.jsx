"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getAuthenticationOptions } from "@/app/actions/webauthn-login"
import { sendEmailOTP } from "@/app/actions/2fa"
import { startAuthentication } from "@simplewebauthn/browser"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [totp, setTotp] = useState("")
  const [is2faStep, setIs2faStep] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      ...(is2faStep && { totp }),
      redirect: false,
    })

    if (result.error) {
      if (result.error === "2FA_REQUIRED_TOTP") {
        setIs2faStep(true)
        setTwoFactorMethod("TOTP")
        setError("")
      } else if (result.error === "2FA_REQUIRED_EMAIL") {
        setIs2faStep(true)
        setTwoFactorMethod("EMAIL")
        setError("")
        // Send the email OTP!
        await sendEmailOTP(email)
      } else if (result.error === "INVALID_2FA") {
        setError("Invalid code. Please try again.")
      } else {
        setError("Invalid email or password")
      }
    } else {
      router.push("/")
      router.refresh()
    }
  }

  const handlePasskeyLogin = async () => {
    if (!email) {
      setError("Please enter your email first to sign in with a Passkey.")
      return
    }
    setError("")

    try {
      const { success, options, error } = await getAuthenticationOptions(email)
      if (!success) {
        setError(error || "Failed to start Passkey login.")
        return
      }

      const authResp = await startAuthentication(options)
      
      const result = await signIn("credentials", {
        email,
        passkeyResponse: JSON.stringify(authResp),
        redirect: false,
      })

      if (result.error) {
        setError(result.error === "PASSKEY_VERIFICATION_FAILED" ? "Passkey verification failed." : "Login failed.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      console.error(err)
      if (err.name === 'NotAllowedError') {
        setError("Passkey login cancelled.")
      } else {
        setError("Error during Passkey login.")
      }
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
          {!is2faStep ? (
            <>
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
            </>
          ) : (
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "500", marginBottom: "6px" }}>
                {twoFactorMethod === "EMAIL" ? "Email Verification Code" : "Authenticator App Code"}
              </label>
              {twoFactorMethod === "EMAIL" && (
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px", marginTop: 0 }}>
                  We've sent a 6-digit code to <strong>{email}</strong>. (Check your server logs in dev mode)
                </p>
              )}
              <input 
                type="text" 
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').substring(0, 6))}
                placeholder="6-digit code"
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid var(--border-secondary)", background: "var(--bg-secondary)", color: "var(--text-primary)", letterSpacing: "2px", textAlign: "center", fontSize: "20px" }}
                required 
                pattern="\d{6}"
              />
            </div>
          )}
          
          <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: "8px" }}>
            {is2faStep ? "Verify Code" : "Sign In"}
          </button>
          
          {is2faStep && (
            <button 
              type="button" 
              onClick={() => { setIs2faStep(false); setTotp(""); }} 
              className="btn btn-ghost btn-full" 
              style={{ marginTop: "-8px" }}
            >
              Back to login
            </button>
          )}
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
          
          <button 
            type="button" 
            onClick={handlePasskeyLogin}
            className="btn btn-ghost btn-full" 
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", border: "1px solid var(--border-secondary)" }}
          >
            <i className="ti ti-fingerprint" style={{ fontSize: "18px" }}></i>
            Sign in with Passkey
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
