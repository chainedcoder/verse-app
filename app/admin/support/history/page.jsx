"use client";

import React from "react";

export default function SupportHistory() {
  const closedTickets = [
    { id: "102", title: "Cannot reset password link", reporter: "Alice Parker", requestType: "Auth", date: "May 20, 2026", resolution: "Sent manually, user logged in successfully" },
    { id: "105", title: "Double charge on subscription", reporter: "Robert Wood", requestType: "Billing", date: "May 25, 2026", resolution: "Refunded via Stripe Dashboard" },
    { id: "111", title: "Reported comment harassment", reporter: "Clara Springs", requestType: "Safety", date: "June 02, 2026", resolution: "Comment removed, user warned" },
    { id: "118", title: "Missing Draft Collection status", reporter: "Leo Davidson", requestType: "General", date: "June 12, 2026", resolution: "Resolved layout bug in Draft grid" }
  ];

  return (
    <div style={{ padding: "40px", fontFamily: "-apple-system, sans-serif", background: "#f8f9fa", height: "100%" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111", margin: "0 0 8px 0" }}>Ticket History</h1>
        <p style={{ fontSize: "15px", color: "#666", margin: 0 }}>Review past closed and archived support requests for historical reference.</p>
      </header>

      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #eaeaea", overflow: "hidden", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "1px solid #eaeaea", fontSize: "13px", fontWeight: "600", color: "#666" }}>
              <th style={{ padding: "16px 24px" }}>Ticket ID</th>
              <th style={{ padding: "16px 24px" }}>Subject</th>
              <th style={{ padding: "16px 24px" }}>Reporter</th>
              <th style={{ padding: "16px 24px" }}>Type</th>
              <th style={{ padding: "16px 24px" }}>Closed Date</th>
              <th style={{ padding: "16px 24px" }}>Resolution</th>
            </tr>
          </thead>
          <tbody>
            {closedTickets.map((ticket, idx) => (
              <tr key={idx} style={{ borderBottom: idx === closedTickets.length - 1 ? "none" : "1px solid #f1f5f9", fontSize: "14px", color: "#333" }}>
                <td style={{ padding: "16px 24px", fontWeight: "600", color: "var(--accent, #7c3aed)" }}>#{ticket.id}</td>
                <td style={{ padding: "16px 24px", fontWeight: "500" }}>{ticket.title}</td>
                <td style={{ padding: "16px 24px" }}>{ticket.reporter}</td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "600", padding: "4px 8px", borderRadius: "12px", background: "var(--accent-soft, #f5f0e8)", color: "var(--accent, #7c3aed)" }}>
                    {ticket.requestType}
                  </span>
                </td>
                <td style={{ padding: "16px 24px", color: "#666" }}>{ticket.date}</td>
                <td style={{ padding: "16px 24px", color: "#475569", fontStyle: "italic" }}>{ticket.resolution}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
