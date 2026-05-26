"use client"

import { Component } from "react"
import Link from "next/link"

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Report to our error API
    try {
      fetch("/api/errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error?.message || "Unknown error",
          stack: error?.stack,
          componentStack: info?.componentStack,
          url: typeof window !== "undefined" ? window.location.href : "",
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Never let error reporting break anything
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="page-container"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}
          role="alert"
          aria-live="assertive"
        >
          <div className="card" style={{ maxWidth: "480px", width: "100%", textAlign: "center", padding: "48px 32px" }}>
            <i
              className="ti ti-alert-triangle"
              aria-hidden="true"
              style={{ fontSize: "48px", color: "var(--danger)", marginBottom: "20px", display: "block" }}
            />
            <h2 className="serif" style={{ fontSize: "24px", marginBottom: "12px" }}>
              Something went wrong
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px", lineHeight: 1.6 }}>
              An unexpected error occurred. We&apos;ve been notified and are working on a fix.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                className="btn btn-primary btn-md"
                onClick={this.handleReset}
              >
                <i className="ti ti-refresh" aria-hidden="true" />
                Try again
              </button>
              <Link href="/" className="btn btn-ghost btn-md">
                <i className="ti ti-home" aria-hidden="true" />
                Go home
              </Link>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details
                style={{
                  marginTop: "28px",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  border: "1px solid var(--border-tertiary)",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: "8px" }}>
                  Error details (dev only)
                </summary>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", margin: 0 }}>
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
