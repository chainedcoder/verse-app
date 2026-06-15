"use client"

import { useState, useTransition } from "react"
import { updateReportStatus, updateUserStatus, deletePoemAdmin } from "@/app/actions/admin"
import Link from "next/link"
import { useToast } from "./ToastProvider"
import { useConfirm } from "./ConfirmProvider"

export default function AdminReportsClient({ initialReports, currentUserRole }) {
  const [reports, setReports] = useState(initialReports)
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()
  const { confirm } = useConfirm()

  const handleUpdateStatus = (reportId, status) => {
    startTransition(async () => {
      const res = await updateReportStatus(reportId, status)
      if (res.success) {
        setReports(prev => prev.filter(r => r.id !== reportId))
      } else {
        showToast(res.error, "error")
      }
    })
  }

  const handleBanUser = async (userId, reportId) => {
    const isConfirmed = await confirm("Are you sure you want to ban this user?")
    if (!isConfirmed) return
    
    startTransition(async () => {
      const res = await updateUserStatus(userId, "BANNED")
      if (res.success) {
        // Automatically resolve the report
        await updateReportStatus(reportId, "RESOLVED")
        setReports(prev => prev.filter(r => r.id !== reportId))
        showToast("User banned and report resolved.", "success")
      } else {
        showToast(res.error, "error")
      }
    })
  }

  const handleDeletePoem = async (poemId, reportId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this poem?")
    if (!isConfirmed) return
    
    startTransition(async () => {
      const res = await deletePoemAdmin(poemId)
      if (res.success) {
        // Automatically resolve the report
        await updateReportStatus(reportId, "RESOLVED")
        setReports(prev => prev.filter(r => r.id !== reportId))
        showToast("Poem deleted and report resolved.", "success")
      } else {
        showToast(res.error, "error")
      }
    })
  }

  if (reports.length === 0) {
    return (
      <div className="empty-state" style={{ padding: "48px 0" }}>
        <i className="ti ti-check" style={{ color: "var(--success)" }}></i>
        <p>No pending reports in the queue. Great job!</p>
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {reports.map(report => {
        let type = "Unknown"
        let targetLink = "#"
        let targetLabel = ""
        let targetId = ""
        
        if (report.reportedPoemId) {
          type = "Poem"
          targetLink = `/poem/${report.reportedPoemId}`
          targetLabel = report.reportedPoem?.title || "Deleted Poem"
          targetId = report.reportedPoemId
        } else if (report.reportedUserId) {
          type = "User"
          targetLink = `/author/${report.reportedUserId}`
          targetLabel = report.reportedUser?.name || "Deleted User"
          targetId = report.reportedUserId
        } else if (report.reportedCommentId) {
          type = "Comment"
          targetLabel = "Comment (See details)"
        }

        return (
          <div key={report.id} style={{ 
            padding: "20px", 
            border: "1px solid var(--border-secondary)", 
            borderRadius: "8px",
            backgroundColor: "var(--bg-secondary)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "12px", fontWeight: "bold", color: "var(--danger)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {type} Report
                </span>
                <h3 style={{ margin: "4px 0", fontSize: "16px" }}>
                  Target: <Link href={targetLink} style={{ color: "var(--primary)" }}>{targetLabel}</Link>
                </h3>
                <div style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                  Reported by <strong>{report.reporter?.name}</strong> on {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button 
                  className="btn btn-ghost btn-sm" 
                  onClick={() => handleUpdateStatus(report.id, "DISMISSED")}
                  disabled={isPending}
                >
                  Dismiss
                </button>
                <button 
                  className="btn btn-primary btn-sm" 
                  onClick={() => handleUpdateStatus(report.id, "RESOLVED")}
                  disabled={isPending}
                >
                  Mark Resolved
                </button>
              </div>
            </div>

            <div style={{ 
              padding: "16px", 
              backgroundColor: "var(--bg-card)", 
              borderLeft: "3px solid var(--danger)", 
              borderRadius: "4px",
              marginBottom: "16px"
            }}>
              <strong style={{ display: "block", marginBottom: "4px", fontSize: "13px" }}>Reason:</strong>
              <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{report.reason}</p>
            </div>

            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-tertiary)", paddingTop: "16px" }}>
              <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-secondary)", alignSelf: "center" }}>Quick Actions:</span>
              
              {type === "Poem" && (
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ color: "var(--danger)" }}
                  onClick={() => handleDeletePoem(targetId, report.id)}
                  disabled={isPending}
                >
                  <i className="ti ti-trash"></i> Delete Poem
                </button>
              )}
              
              {(type === "User" || type === "Poem") && (
                <button 
                  className="btn btn-ghost btn-sm" 
                  style={{ color: "var(--danger)" }}
                  onClick={() => handleBanUser(type === "User" ? targetId : report.reportedPoem?.authorId, report.id)}
                  disabled={isPending}
                >
                  <i className="ti ti-user-x"></i> Ban User
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
