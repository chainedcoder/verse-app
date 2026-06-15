"use client"

import React, { createContext, useContext, useState, useCallback, useRef } from "react"

const ConfirmContext = createContext({
  confirm: async () => false
})

export const useConfirm = () => useContext(ConfirmContext)

export function ConfirmProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    message: "",
    resolve: null
  })
  
  const confirmRef = useRef(null)

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        message,
        resolve
      })
      // Focus confirm button after a brief delay
      setTimeout(() => {
        if (confirmRef.current) confirmRef.current.focus()
      }, 50)
    })
  }, [])

  const handleConfirm = () => {
    if (modalState.resolve) modalState.resolve(true)
    setModalState({ isOpen: false, message: "", resolve: null })
  }

  const handleCancel = () => {
    if (modalState.resolve) modalState.resolve(false)
    setModalState({ isOpen: false, message: "", resolve: null })
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      
      {modalState.isOpen && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", zIndex: 10000,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "20px", backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease-out"
          }}
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) handleCancel() }}
        >
          <div className="card" style={{ padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", textAlign: "center", animation: "slideUpModal 0.2s ease-out" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#ef4444" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            
            <h3 className="serif" style={{ fontSize: "24px", marginBottom: "16px" }}>
              Are you sure?
            </h3>
            
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.5, fontSize: "15px" }}>
              {modalState.message}
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: "#ef4444", borderColor: "#ef4444", color: "white" }}
                onClick={handleConfirm}
                ref={confirmRef}
              >
                Confirm
              </button>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUpModal { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}} />
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
