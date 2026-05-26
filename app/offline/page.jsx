"use client"

export default function Offline() {
  return (
    <div
      className="page-container"
      style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}
    >
      <div className="card" style={{ maxWidth: "440px", width: "100%", textAlign: "center", padding: "48px 32px" }}>
        <i
          className="ti ti-wifi-off"
          aria-hidden="true"
          style={{ fontSize: "52px", color: "var(--text-tertiary)", marginBottom: "20px", display: "block" }}
        />
        <h1 className="serif" style={{ fontSize: "28px", marginBottom: "12px" }}>
          You&apos;re offline
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.6, marginBottom: "28px" }}>
          It looks like you&apos;ve lost your connection. Check your network and try again.
        </p>
        <button
          className="btn btn-primary btn-md"
          onClick={() => window.location.reload()}
        >
          <i className="ti ti-refresh" aria-hidden="true" /> Retry
        </button>
      </div>
    </div>
  )
}
