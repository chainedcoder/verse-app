"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"

const ToastContext = createContext({
  showUndoToast: () => {},
})

export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showUndoToast = useCallback((message, onUndo) => {
    const id = Date.now().toString()
    
    setToasts(prev => [...prev, { id, message, onUndo }])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  const handleUndo = async (toast) => {
    // Remove toast immediately
    setToasts(prev => prev.filter(t => t.id !== toast.id))
    
    // Execute undo action
    if (toast.onUndo) {
      await toast.onUndo()
    }
  }

  const handleDismiss = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showUndoToast }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: "fixed",
        bottom: "24px",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        zIndex: 9999,
        pointerEvents: "none"
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            border: "1px solid var(--border-secondary)",
            display: "flex",
            alignItems: "center",
            gap: "16px",
            pointerEvents: "auto",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}>
            <span style={{ fontSize: "14px", fontWeight: "500" }}>{toast.message}</span>
            <div style={{ display: "flex", gap: "8px", borderLeft: "1px solid var(--border-tertiary)", paddingLeft: "16px" }}>
              <button 
                onClick={() => handleUndo(toast)}
                style={{
                  background: "transparent", border: "none", color: "var(--accent)",
                  fontWeight: "600", fontSize: "14px", cursor: "pointer", padding: "4px"
                }}
              >
                Undo
              </button>
              <button 
                onClick={() => handleDismiss(toast.id)}
                style={{
                  background: "transparent", border: "none", color: "var(--text-tertiary)",
                  fontSize: "14px", cursor: "pointer", padding: "4px"
                }}
                aria-label="Dismiss"
              >
                <i className="ti ti-x"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />
    </ToastContext.Provider>
  )
}
