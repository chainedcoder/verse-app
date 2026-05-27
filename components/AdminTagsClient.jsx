"use client"

import { useState, useTransition } from "react"
import { renameTagAdmin, deleteTagAdmin } from "@/app/actions/admin"

export default function AdminTagsClient({ initialTags, currentUserRole }) {
  const [tags, setTags] = useState(initialTags)
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleRename = (tagId, oldName) => {
    const newName = prompt("Enter new name for tag:", oldName)
    if (!newName || newName === oldName) return

    startTransition(async () => {
      const res = await renameTagAdmin(tagId, newName)
      if (res.success) {
        setTags(prev => prev.map(t => t.id === tagId ? { ...t, name: newName } : t))
      } else {
        alert(res.error)
      }
    })
  }

  const handleDelete = (tagId, tagName) => {
    if (!confirm(`Are you sure you want to permanently delete the tag "${tagName}"?`)) return

    startTransition(async () => {
      const res = await deleteTagAdmin(tagId)
      if (res.success) {
        setTags(prev => prev.filter(t => t.id !== tagId))
      } else {
        alert(res.error)
      }
    })
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <input 
          type="search" 
          placeholder="Search tags..." 
          className="input" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", maxWidth: "400px" }}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-secondary)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "12px 8px" }}>Name</th>
              <th style={{ padding: "12px 8px" }}>Usage Count</th>
              <th style={{ padding: "12px 8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTags.map(tag => (
              <tr key={tag.id} style={{ borderBottom: "1px solid var(--border-tertiary)" }}>
                <td style={{ padding: "12px 8px", fontWeight: "600", color: "var(--text-primary)" }}>
                  #{tag.name}
                </td>
                <td style={{ padding: "12px 8px", color: "var(--text-secondary)" }}>
                  {tag._count.poems} poems
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleRename(tag.id, tag.name)}
                      disabled={isPending}
                    >
                      Rename
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: "var(--danger)", fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleDelete(tag.id, tag.name)}
                      disabled={isPending}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTags.length === 0 && (
          <div className="empty-state" style={{ padding: "32px 0" }}>No tags found.</div>
        )}
      </div>
    </div>
  )
}
