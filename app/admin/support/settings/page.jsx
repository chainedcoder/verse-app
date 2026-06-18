"use client";

import React, { useState, useEffect } from "react";

export default function SupportSettings() {
  const [slaTime, setSlaTime] = useState("20");
  const [autoAssign, setAutoAssign] = useState(true);
  const [safetyAlert, setSafetyAlert] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Workspace Layout Preferences states initialized synchronously from localStorage
  const [openAsChatTabs, setOpenAsChatTabs] = useState(() => {
    if (typeof window !== "undefined") {
      const setting = localStorage.getItem("support_open_as_chat_tabs");
      return setting !== "false"; // Default to true
    }
    return true;
  });
  const [openInNewTab, setOpenInNewTab] = useState(() => {
    if (typeof window !== "undefined") {
      const setting = localStorage.getItem("support_open_in_browser_tab");
      return setting === "true";
    }
    return false;
  });

  const handleSave = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("support_open_as_chat_tabs", String(openAsChatTabs));
      localStorage.setItem("support_open_in_browser_tab", String(openInNewTab));
    }
    setToastMessage("Settings saved successfully!");
    setTimeout(() => setToastMessage(""), 3000);
  };

  return (
    <div style={{ padding: "40px", fontFamily: "-apple-system, sans-serif", background: "#f8f9fa", height: "100%" }}>
      <header style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111", margin: "0 0 8px 0" }}>Support Settings</h1>
        <p style={{ fontSize: "15px", color: "#666", margin: 0 }}>Configure ticket queues, SLA guidelines, and automatic moderation actions.</p>
      </header>

      <form onSubmit={handleSave} style={{ background: "white", padding: "32px", borderRadius: "12px", border: "1px solid #eaeaea", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* SLA Time Limit */}
        <div>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#111", display: "block", marginBottom: "8px" }}>Response SLA Target (Minutes)</label>
          <input 
            type="number" 
            style={{ 
              width: "100%", 
              padding: "10px 12px", 
              border: `1px solid ${isFocused ? "var(--accent, #7c3aed)" : "#cbd5e1"}`, 
              boxShadow: isFocused ? "0 0 0 2px var(--accent-soft)" : "none",
              borderRadius: "8px", 
              fontSize: "14px", 
              outline: "none",
              transition: "all 0.15s ease"
            }}
            value={slaTime}
            onChange={(e) => setSlaTime(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <span style={{ fontSize: "12px", color: "#666", marginTop: "4px", display: "block" }}>First response target for standard priority tickets.</span>
        </div>

        {/* Auto Assign */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#111", display: "block" }}>Automatic Ticket Assignment</label>
            <span style={{ fontSize: "12px", color: "#666" }}>Automatically assign incoming tickets to online support agents.</span>
          </div>
          <input 
            type="checkbox" 
            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent)" }}
            checked={autoAssign}
            onChange={(e) => setAutoAssign(e.target.checked)}
          />
        </div>

        {/* Safety Flags Alert */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#111", display: "block" }}>Safety Flag Escalate</label>
            <span style={{ fontSize: "12px", color: "#666" }}>Raise critical severity alarm for high-confidence toxic comments immediately.</span>
          </div>
          <input 
            type="checkbox" 
            style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "var(--accent)" }}
            checked={safetyAlert}
            onChange={(e) => setSafetyAlert(e.target.checked)}
          />
        </div>

        <div style={{ height: "1px", background: "#eaeaea", margin: "8px 0" }} />

        {/* WORKSPACE PREFERENCES TITLE */}
        <div>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#111", margin: "0 0 4px 0" }}>Workspace Preferences</h2>
          <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Configure how ticket details and conversational windows load in your admin panel.</p>
        </div>

        {/* Switch: Open as Chat Tabs */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ marginRight: "16px", flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#111", display: "block", marginBottom: "4px" }}>Open as Chat Tabs</label>
            <span style={{ fontSize: "12px", color: "#666" }}>Enable horizontal tabs above the thread area to handle multiple conversations. If disabled, clicking a ticket replaces the active conversation.</span>
          </div>
          {/* Custom Switch Toggle Slider */}
          <div 
            onClick={() => setOpenAsChatTabs(!openAsChatTabs)}
            style={{
              position: "relative",
              width: "36px",
              height: "20px",
              backgroundColor: openAsChatTabs ? "var(--accent, #7c3aed)" : "#cbd5e1",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0
            }}
          >
            <div style={{
              position: "absolute",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "white",
              top: "3px",
              left: openAsChatTabs ? "19px" : "3px",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
            }} />
          </div>
        </div>

        {/* Switch: Open in New Browser Tab */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ marginRight: "16px", flex: 1 }}>
            <label style={{ fontSize: "14px", fontWeight: "600", color: "#111", display: "block", marginBottom: "4px" }}>Open in New Browser Tab</label>
            <span style={{ fontSize: "12px", color: "#666" }}>Launch a focused full-screen ticket view in a new browser tab or window when clicked. (Takes precedence over Chat Tabs).</span>
          </div>
          {/* Custom Switch Toggle Slider */}
          <div 
            onClick={() => setOpenInNewTab(!openInNewTab)}
            style={{
              position: "relative",
              width: "36px",
              height: "20px",
              backgroundColor: openInNewTab ? "var(--accent, #7c3aed)" : "#cbd5e1",
              borderRadius: "20px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0
            }}
          >
            <div style={{
              position: "absolute",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "white",
              top: "3px",
              left: openInNewTab ? "19px" : "3px",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
            }} />
          </div>
        </div>

        <button type="submit" style={{ padding: "12px 24px", background: "var(--accent, #7c3aed)", color: "var(--accent-text, white)", border: "none", borderRadius: "8px", fontWeight: "600", fontSize: "14px", cursor: "pointer", width: "fit-content", marginTop: "12px" }}>
          Save Configuration
        </button>
      </form>

      {toastMessage && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "#1a1a1a", color: "white", padding: "12px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: "500", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
