"use client"

import { useState, useTransition, useMemo } from "react"
import { createPermissionGroup, updatePermissionGroup, deletePermissionGroup } from "@/app/actions/admin"
import { Shield, Plus, Trash2, Check, X, AlertCircle } from "lucide-react"

const PERMISSION_SECTIONS = [
  {
    key: "user",
    title: "USER Permission",
    actions: ["View User", "Edit User", "Reset Password", "Create User", "Delete User"]
  },
  {
    key: "poem",
    title: "POEM/CONTENT Permission",
    actions: ["View Poem", "Edit Poem", "Create Poem", "Delete Poem"]
  },
  {
    key: "tag",
    title: "TAG Permission",
    actions: ["View Tag", "Edit Tag", "Create Tag", "Delete Tag"]
  },
  {
    key: "report",
    title: "REPORT Permission",
    actions: ["View Reports", "Resolve Reports", "Dismiss Reports"]
  },
  {
    key: "role",
    title: "ROLE/RBAC Permission",
    actions: ["View Role", "Edit Role", "Create Role", "Delete Role"]
  },
  {
    key: "system",
    title: "SYSTEM Permission",
    actions: ["Manage Ads", "Change Algorithms", "System Settings", "View Revenue"]
  }
]

export default function AdminRolesClient({ initialGroups }) {
  const [groups, setGroups] = useState(initialGroups || [])
  const [selectedGroup, setSelectedGroup] = useState(groups[0] || null)
  const [isPending, startTransition] = useTransition()
  
  // Create group states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupColor, setNewGroupColor] = useState("blue")
  const [errorMsg, setErrorMsg] = useState("")

  // Edit group permissions local state
  const [editedPermissions, setPermissions] = useState(
    selectedGroup?.permissions || {}
  )

  const handleSelectGroup = (group) => {
    setSelectedGroup(group)
    setPermissions(group.permissions || {})
  }

  const togglePermission = (sectionKey, action) => {
    setPermissions(prev => {
      const section = prev[sectionKey] || []
      const next = section.includes(action)
        ? section.filter(a => a !== action)
        : [...section, action]
      return { ...prev, [sectionKey]: next }
    })
  }

  const toggleSelectAllSection = (sectionKey, actions, isAllChecked) => {
    setPermissions(prev => ({
      ...prev,
      [sectionKey]: isAllChecked ? [] : [...actions]
    }))
  }

  const handleSaveChanges = () => {
    if (!selectedGroup) return
    startTransition(async () => {
      const res = await updatePermissionGroup(selectedGroup.id, {
        name: selectedGroup.name,
        color: selectedGroup.color,
        permissions: editedPermissions
      })
      if (res.success) {
        setGroups(prev => prev.map(g => g.id === selectedGroup.id ? res.group : g))
        setSelectedGroup(res.group)
        alert("Permissions updated successfully!")
      } else {
        alert(res.error)
      }
    })
  }

  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    startTransition(async () => {
      const res = await createPermissionGroup({
        name: newGroupName,
        color: newGroupColor,
        permissions: {}
      })
      if (res.success) {
        setGroups(prev => [...prev, { ...res.group, _count: { users: 0 } }])
        setSelectedGroup(res.group)
        setPermissions({})
        setNewGroupName("")
        setShowCreateModal(false)
        setErrorMsg("")
      } else {
        setErrorMsg(res.error)
      }
    })
  }

  const handleDeleteGroup = (id) => {
    if (!confirm("Are you sure you want to delete this permission group? This cannot be undone.")) return
    startTransition(async () => {
      const res = await deletePermissionGroup(id)
      if (res.success) {
        const nextGroups = groups.filter(g => g.id !== id)
        setGroups(nextGroups)
        setSelectedGroup(nextGroups[0] || null)
        setPermissions(nextGroups[0]?.permissions || {})
      } else {
        alert(res.error)
      }
    })
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid #e2e8f0", paddingBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#0f172a", margin: "0 0 4px 0" }}>Roles & Permissions Management</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Configure and assign Role-Based Access Control (RBAC) across permission groups.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#3b82f6", color: "white", border: "none", borderRadius: "8px", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
        >
          <Plus size={16} />
          Create Group
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "32px" }}>
        {/* Left Side: Active Permission Groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", margin: 0 }}>Permission Groups</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {groups.map(group => {
              const isSelected = selectedGroup?.id === group.id
              return (
                <div
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px",
                    backgroundColor: isSelected ? "#eff6ff" : "white",
                    borderRadius: "10px",
                    border: "1.5px solid" + (isSelected ? " #3b82f6" : " #e2e8f0"),
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: group.color || "blue" }}></div>
                    <span style={{ fontWeight: "600", color: isSelected ? "#1d4ed8" : "#1e293b", fontSize: "15px" }}>{group.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", color: isSelected ? "#3b82f6" : "#64748b", backgroundColor: isSelected ? "#dbeafe" : "#f1f5f9", padding: "4px 8px", borderRadius: "100px", fontWeight: "500" }}>
                      {(group._count?.users || 0)} Users
                    </span>
                    {group.name !== "Super Administrator" && group.name !== "User" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#ef4444" }}
                        title="Delete Role"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Permission Matrix Editor */}
        {selectedGroup ? (
          <div style={{ backgroundColor: "white", padding: "28px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "16px", marginBottom: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Shield size={20} color="#3b82f6" />
                <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: 0 }}>Role Editor: {selectedGroup.name}</h3>
              </div>
              <p style={{ fontSize: "13px", color: "#64748b", margin: "6px 0 0 0" }}>Check or uncheck explicit capabilities. These section values will populate defaults for assigned users.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {PERMISSION_SECTIONS.map(section => {
                const checkedActions = editedPermissions[section.key] || []
                const isAllChecked = section.actions.every(act => checkedActions.includes(opt => opt === act || checkedActions.includes(act)))
                
                return (
                  <div key={section.key} style={{ backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #f1f5f9", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "16px" }}>
                      <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155", textTransform: "uppercase", letterSpacing: "0.5px" }}>{section.title}</span>
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#3b82f6", fontWeight: "500", cursor: "pointer" }}>
                        <input
                          type="checkbox"
                          checked={isAllChecked}
                          onChange={() => toggleSelectAllSection(section.key, section.actions, isAllChecked)}
                          style={{ width: "15px", height: "15px", accentColor: "#3b82f6", cursor: "pointer" }}
                        />
                        Select All
                      </label>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                      {section.actions.map(action => {
                        const isChecked = checkedActions.includes(action)
                        return (
                          <label key={action} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#334155", cursor: "pointer", padding: "4px 0" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(section.key, action)}
                              style={{ width: "15px", height: "15px", accentColor: "#3b82f6", cursor: "pointer" }}
                            />
                            {action}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" }}>
              <button
                onClick={() => setPermissions(selectedGroup.permissions || {})}
                disabled={isPending}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "#334155", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
              >
                Reset
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isPending}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "white", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "white", borderRadius: "12px", border: "1px solid #e2e8f0", padding: "40px", textAlign: "center" }}>
            <Shield size={48} color="#94a3b8" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "16px", color: "#334155", margin: "0 0 8px 0" }}>No Group Selected</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Create a permission group to begin configuring system capabilities.</p>
          </div>
        )}
      </div>

      {/* Create Permission Group Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "white", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", margin: 0 }}>Create Permission Group</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroup}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#344054", marginBottom: "6px" }}>Group Name</label>
                <input
                  type="text"
                  required
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "14px" }}
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. Content Reviewer"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "#344054", marginBottom: "8px" }}>Group Theme Color</label>
                <div style={{ display: "flex", gap: "10px" }}>
                  {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#64748b"].map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewGroupColor(col)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: col,
                        border: newGroupColor === col ? "3px solid #000" : "none",
                        cursor: "pointer",
                        transition: "all 0.1s"
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "#334155", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: "#3b82f6", color: "white", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
