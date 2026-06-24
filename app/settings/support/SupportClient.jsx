"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

export default function SupportClient({ initialTickets, initialChats, userId }) {
  const [tickets, setTickets] = useState(initialTickets || [])
  const [chats, setChats] = useState(initialChats || [])
  const [activeTab, setActiveTab] = useState("tickets") // "tickets" | "chats"
  const [loading, setLoading] = useState(false)
  const [selectedTicketId, setSelectedTicketId] = useState(null)

  const parseMessageContent = (content) => {
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        return parsed.join("\n")
      }
      return content
    } catch (e) {
      return content
    }
  }

  const handleSendReply = async (e, ticket) => {
    e.preventDefault()
    const form = e.target
    const textarea = form.querySelector("textarea")
    const replyText = textarea.value.trim()
    if (!replyText) return

    try {
      const res = await fetch(`/api/user/chat/${ticket.threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: JSON.stringify([replyText])
        })
      })

      if (res.ok) {
        textarea.value = ""
        
        // Optimistically update tickets state
        setTickets(prevTickets => prevTickets.map(t => {
          if (t.id === ticket.id) {
            const thread = t.thread || { messages: [] }
            const updatedMessages = [
              ...(thread.messages || []),
              {
                id: "temp-msg-" + Date.now(),
                senderType: "user",
                senderId: userId,
                content: JSON.stringify([replyText]),
                createdAt: new Date().toISOString()
              }
            ]
            return {
              ...t,
              thread: {
                ...thread,
                messages: updatedMessages
              }
            }
          }
          return t
        }))
      } else {
        console.error("Failed to send reply")
      }
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setTickets(initialTickets || [])
  }, [initialTickets])

  useEffect(() => {
    setChats(initialChats || [])
  }, [initialChats])
  const dialogRef = useRef(null)
  const router = useRouter()

  const [category, setCategory] = useState("Account")
  const [priority, setPriority] = useState("Low")
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showPriorityMenu, setShowPriorityMenu] = useState(false)

  const categoryOptions = ["Account", "Billing", "Moderation", "Bug Report", "Other"]
  const priorityOptions = ["Low", "Medium", "High"]

  // Close menus when clicking outside
  useEffect(() => {
    const closeMenus = () => {
      setShowCategoryMenu(false)
      setShowPriorityMenu(false)
    }
    window.addEventListener("click", closeMenus)
    return () => window.removeEventListener("click", closeMenus)
  }, [])

  // Fallback for light-dismiss if closedby is not supported
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleLightDismiss = (event) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent = (
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width
        );
        if (!isDialogContent) {
          dialog.close();
        }
      };
      dialog.addEventListener('click', handleLightDismiss);
      return () => dialog.removeEventListener('click', handleLightDismiss);
    }
  }, []);

  const handleOpenDialog = () => {
    if (dialogRef.current) dialogRef.current.showModal()
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.target)
    const payload = {
      title: formData.get("title"),
      category: category,
      priority: priority,
      requestType: "General",
      snippet: formData.get("snippet")
    }

    try {
      const res = await fetch("/api/user/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        if (dialogRef.current) dialogRef.current.close()
        router.refresh()
        e.target.reset()
      } else {
        console.error("Failed to submit ticket")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartLiveChat = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/chat", { method: "POST" })
      if (res.ok) {
        router.refresh()
        setActiveTab("chats")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <button 
          onClick={() => setActiveTab("tickets")}
          style={{ 
            padding: "8px 16px", 
            borderBottom: activeTab === "tickets" ? "2px solid var(--accent, #7c3aed)" : "2px solid transparent",
            fontWeight: activeTab === "tickets" ? "600" : "400",
            background: "none",
            borderTop: "none", borderLeft: "none", borderRight: "none",
            cursor: "pointer",
            color: activeTab === "tickets" ? "var(--fg)" : "var(--fg-secondary)"
          }}
        >
          My Tickets
        </button>
        <button 
          onClick={() => setActiveTab("chats")}
          style={{ 
            padding: "8px 16px", 
            borderBottom: activeTab === "chats" ? "2px solid var(--accent, #7c3aed)" : "2px solid transparent",
            fontWeight: activeTab === "chats" ? "600" : "400",
            background: "none",
            borderTop: "none", borderLeft: "none", borderRight: "none",
            cursor: "pointer",
            color: activeTab === "chats" ? "var(--fg)" : "var(--fg-secondary)"
          }}
        >
          Live Chats
        </button>
      </div>

      <div style={{ marginBottom: "24px" }}>
        {activeTab === "tickets" && (
          <button className="btn btn-primary" onClick={handleOpenDialog}>
            + Create New Ticket
          </button>
        )}
        {activeTab === "chats" && (
          <button className="btn btn-primary" onClick={handleStartLiveChat} disabled={loading}>
            {loading ? "Starting..." : "+ Start New Live Chat"}
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {activeTab === "tickets" && tickets.length === 0 && (
          <p style={{ color: "var(--fg-secondary)" }}>You have no open tickets.</p>
        )}
        {activeTab === "tickets" && tickets.map(ticket => (
          <div 
            key={ticket.id} 
            onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
            style={{ 
              padding: "16px", 
              border: "1px solid var(--border)", 
              borderRadius: "8px", 
              background: "var(--bg-secondary)",
              cursor: "pointer",
              transition: "transform 0.2s"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>{ticket.title}</h3>
              <span style={{ 
                fontSize: "12px", 
                padding: "2px 8px", 
                borderRadius: "12px", 
                background: ticket.status === "Closed" ? "#e0e0e0" : "var(--accent-soft, #f5f0e8)", 
                color: ticket.status === "Closed" ? "#666" : "var(--accent, #7c3aed)" 
              }}>
                {ticket.status}
              </span>
            </div>
            <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--fg-secondary)" }}>{ticket.snippet}</p>
            <div style={{ fontSize: "12px", color: "var(--fg-secondary)", marginBottom: selectedTicketId === ticket.id ? "16px" : "0" }}>
              {new Date(ticket.createdAt).toLocaleDateString()} &middot; {ticket.category}
            </div>

            {selectedTicketId === ticket.id && (
              <div onClick={(e) => e.stopPropagation()} style={{ borderTop: "1px solid var(--border)", paddingTop: "16px", marginTop: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>Conversation</h4>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px", maxHeight: "300px", overflowY: "auto", padding: "4px" }}>
                  {/* Initial snippet from user */}
                  <div style={{ alignSelf: "flex-start", maxWidth: "80%", background: "var(--bg)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "12px", color: "var(--fg-secondary)", marginBottom: "4px" }}>You (Description)</div>
                    <div style={{ fontSize: "14px" }}>{ticket.snippet}</div>
                  </div>

                  {/* Messages list */}
                  {(ticket.thread?.messages || []).map(msg => {
                    const isUser = msg.senderType === "user";
                    return (
                      <div 
                        key={msg.id} 
                        style={{ 
                          alignSelf: isUser ? "flex-end" : "flex-start", 
                          maxWidth: "80%", 
                          background: isUser ? "var(--accent-soft, #f5f0e8)" : "var(--bg)", 
                          color: isUser ? "var(--accent, #7c3aed)" : "var(--fg)",
                          padding: "10px 12px", 
                          borderRadius: "8px", 
                          border: "1px solid var(--border)" 
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "var(--fg-secondary)", marginBottom: "4px" }}>
                          {isUser ? "You" : "Agent"} &middot; {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: "14px" }} dangerouslySetInnerHTML={{ __html: parseMessageContent(msg.content) }} />
                      </div>
                    );
                  })}
                </div>

                {ticket.status !== "Closed" && (
                  <form onSubmit={(e) => handleSendReply(e, ticket)} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <textarea 
                      className="form-control ql-editor" 
                      placeholder="Type your message..."
                      required
                      style={{ minHeight: "60px", resize: "vertical" }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ alignSelf: "flex-end" }}>
                      Send
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}

        {activeTab === "chats" && chats.length === 0 && (
          <p style={{ color: "var(--fg-secondary)" }}>No active live chats.</p>
        )}
        {activeTab === "chats" && chats.map(chat => (
          <div key={chat.id} style={{ padding: "16px", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-secondary)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>Chat session</h3>
              <span style={{ fontSize: "12px", color: "var(--fg-secondary)" }}>{new Date(chat.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "var(--fg-secondary)" }}>
              {chat.messages?.length > 0 ? parseMessageContent(chat.messages[chat.messages.length - 1].content) : "No messages yet"}
            </p>
          </div>
        ))}
      </div>

      {/* Modern Modal using <dialog> */}
      <style>{`
        dialog::backdrop {
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
        }
        .support-dialog {
          padding: 24px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--fg);
          width: 100%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
        }
        .form-control {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--border-secondary);
          background: var(--bg-secondary);
          color: var(--fg);
        }
        .custom-select {
          position: relative;
          cursor: pointer;
        }
        .custom-select-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .custom-select-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-top: 4px;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .custom-select-option {
          padding: 10px;
          transition: background 0.2s, color 0.2s;
        }
        .custom-select-option:hover {
          background: var(--accent-soft, #f5f0e8);
          color: var(--accent, #7c3aed);
        }
      `}</style>
      <dialog ref={dialogRef} className="support-dialog" closedby="any" aria-labelledby="dialogTitle">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 id="dialogTitle" style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>Submit a Request</h2>
          <form method="dialog">
            <button type="submit" style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--fg-secondary)" }}>&times;</button>
          </form>
        </div>
        <form onSubmit={handleSubmitTicket}>
          <div className="form-group">
            <label>Issue Title</label>
            <input name="title" required className="form-control" placeholder="e.g. Account Access Issue" />
          </div>
          <div className="form-group" style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Category</label>
              <div 
                className="custom-select" 
                onClick={(e) => { e.stopPropagation(); setShowCategoryMenu(!showCategoryMenu); setShowPriorityMenu(false); }}
              >
                <div className="form-control custom-select-trigger">
                  {category}
                  <span style={{ fontSize: "12px" }}>▼</span>
                </div>
                {showCategoryMenu && (
                  <div className="custom-select-menu">
                    {categoryOptions.map(opt => (
                      <div 
                        key={opt} 
                        className="custom-select-option"
                        onClick={() => setCategory(opt)}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label>Priority</label>
              <div 
                className="custom-select" 
                onClick={(e) => { e.stopPropagation(); setShowPriorityMenu(!showPriorityMenu); setShowCategoryMenu(false); }}
              >
                <div className="form-control custom-select-trigger">
                  {priority}
                  <span style={{ fontSize: "12px" }}>▼</span>
                </div>
                {showPriorityMenu && (
                  <div className="custom-select-menu">
                    {priorityOptions.map(opt => (
                      <div 
                        key={opt} 
                        className="custom-select-option"
                        onClick={() => setPriority(opt)}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="snippet" required className="form-control" rows="4" placeholder="Please describe your issue in detail..."></textarea>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
            <button type="button" className="btn btn-ghost" onClick={() => dialogRef.current?.close()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  )
}
