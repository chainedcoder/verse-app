"use client";

import React from "react";

export default function SupportDashboard() {
  const stats = [
    { label: "Active Tickets", value: "12", change: "+2 from yesterday" },
    { label: "Resolved Today", value: "36", change: "94% target met" },
    { label: "Avg. First Response", value: "14m", change: "-3m from last week" },
    { label: "Customer Sat.", value: "98.4%", change: "+0.2% vs avg" }
  ];

  return (
    <div style={{ padding: "40px", fontFamily: "-apple-system, sans-serif", background: "#f8f9fa", height: "100%" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111", margin: "0 0 8px 0" }}>Verse Support Center</h1>
        <p style={{ fontSize: "15px", color: "#666", margin: 0 }}>Overview of current platform ticket volumes and moderation activities.</p>
      </header>

      {/* Grid of Statistics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginBottom: "40px" }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: "white", padding: "24px", borderRadius: "12px", border: "1px solid #eaeaea", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#666", display: "block", marginBottom: "12px" }}>{stat.label}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontSize: "32px", fontWeight: "700", color: "var(--accent, #7c3aed)" }}>{stat.value}</span>
            </div>
            <span style={{ fontSize: "12px", color: "#888", display: "block", marginTop: "8px" }}>{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Main Support Queue Status */}
      <div style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid #eaeaea" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "#111", margin: "0 0 16px 0" }}>Support Queue Health</h2>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", background: "var(--accent-soft, #f5f0e8)", border: "1px solid var(--accent, #7c3aed)", padding: "16px 20px", borderRadius: "8px", color: "var(--accent, #7c3aed)", fontSize: "14px" }}>
          <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div style={{ fontWeight: "500" }}>
            <strong style={{ fontWeight: "700" }}>All systems operational.</strong> The support response queue is fully healthy. Current first response SLA is well within the 20-minute platform target.
          </div>
        </div>
      </div>
    </div>
  );
}
