"use client"

import { useState, useTransition, useMemo } from "react"
import { createPermissionGroup, updatePermissionGroup, deletePermissionGroup } from "@/app/actions/admin"
import { Shield, Plus, Trash2, Check, X, AlertCircle } from "lucide-react"
import { useToast } from "./ToastProvider"
import { useConfirm } from "./ConfirmProvider"
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
  const { showToast } = useToast()
  const { confirm } = useConfirm()
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
        showToast("Permissions updated successfully!", "success")
      } else {
        showToast(res.error, "error")
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

  const handleDeleteGroup = async (id) => {
    const isConfirmed = await confirm("Are you sure you want to delete this permission group? This cannot be undone.");
    if (!isConfirmed) return
    startTransition(async () => {
      const res = await deletePermissionGroup(id)
      if (res.success) {
        const nextGroups = groups.filter(g => g.id !== id)
        setGroups(nextGroups)
        setSelectedGroup(nextGroups[0] || null)
        setPermissions(nextGroups[0]?.permissions || {})
      } else {
        showToast(res.error, "error")
      }
    })
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#0f172a", margin: "0 0 4px 0" }}>Roles & Permissions Management</h2>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Configure and assign Role-Based Access Control (RBAC) across permission groups.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: 'var(--accent)', color: "var(--bg-card)", border: "none", borderRadius: "8px", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
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
                    alignItems: "flex-start",
                    padding: "20px",
                    backgroundColor: isSelected ? "var(--accent-soft)" : "var(--bg-card)",
                    borderRadius: "12px",
                    border: "2px solid" + (isSelected ? " var(--accent)" : " var(--border-secondary)"),
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: group.color || "blue", flexShrink: 0 }}></div>
                      <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "16px" }}>{group.name}</span>
                    </div>
                    <span style={{ fontSize: "13px", color: 'var(--accent)', fontWeight: "500" }}>
                      View role permissions
                    </span>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px" }}>
                    <span style={{ fontSize: "13px", color: isSelected ? "var(--accent)" : "var(--text-secondary)", backgroundColor: isSelected ? "var(--accent-soft)" : "var(--bg-secondary)", padding: "4px 12px", borderRadius: "100px", fontWeight: "600", whiteSpace: "nowrap" }}>
                      {Object.values(group.permissions || {}).flat().length} permissions
                    </span>
                    {group.name !== "Super Administrator" && group.name !== "User" && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteGroup(group.id); }}
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#ef4444" }}
                        title="Delete Role"
                      >
                        <Trash2 size={16} />
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
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {PERMISSION_SECTIONS.map(section => {
              const checkedActions = editedPermissions[section.key] || []
              const isAllChecked = section.actions.every(act => checkedActions.includes(act))
              
              return (
                <div key={section.key} style={{ backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-secondary)", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "16px", marginBottom: "20px" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{section.title}</span>
                    <button 
                      onClick={() => toggleSelectAllSection(section.key, section.actions, isAllChecked)}
                      style={{ background: "none", border: "none", fontSize: "14px", color: 'var(--accent)', fontWeight: "500", cursor: "pointer", padding: 0 }}
                    >
                      {isAllChecked ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "20px", columnGap: "40px" }}>
                    {section.actions.map(action => {
                      const isChecked = checkedActions.includes(action)
                      return (
                        <label key={action} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", color: "var(--text-primary)", cursor: "pointer" }}>
                          <span style={{ fontWeight: "500" }}>{action}</span>
                          <div style={{ position: "relative" }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => togglePermission(section.key, action)}
                              style={{ opacity: 0, position: "absolute", width: 0, height: 0 }}
                            />
                            <div style={{
                              width: "40px",
                              height: "24px",
                              backgroundColor: isChecked ? 'var(--accent)' : "var(--bg-secondary)",
                              borderRadius: "24px",
                              transition: "background-color 0.2s",
                              border: "1px solid var(--border-secondary)"
                            }}>
                              <div style={{
                                position: "absolute",
                                top: "2px",
                                left: isChecked ? "18px" : "2px",
                                width: "18px",
                                height: "18px",
                                backgroundColor: isChecked ? "#ffffff" : "var(--text-secondary)",
                                borderRadius: "50%",
                                transition: "left 0.2s",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.2)"
                              }} />
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => setPermissions(selectedGroup.permissions || {})}
                disabled={isPending}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid var(--border-tertiary)", background: "var(--bg-card)", color: "var(--text-primary)", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
              >
                Reset
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={isPending}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "none", background: 'var(--accent)', color: "#ffffff", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-secondary)", padding: "40px", textAlign: "center" }}>
            <Shield size={48} color="#94a3b8" style={{ marginBottom: "16px" }} />
            <h3 style={{ fontSize: "16px", color: "#334155", margin: "0 0 8px 0" }}>No Group Selected</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Create a permission group to begin configuring system capabilities.</p>
          </div>
        )}
      </div>

      {/* Create Permission Group Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "var(--bg-card)", padding: "32px", borderRadius: "12px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
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
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--border-tertiary)", borderRadius: "8px", fontSize: "14px" }}
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
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid var(--border-tertiary)", background: "var(--bg-card)", color: "#334155", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ padding: "10px 16px", borderRadius: "8px", border: "none", background: 'var(--accent)', color: "var(--bg-card)", fontWeight: "500", cursor: "pointer", fontSize: "14px" }}
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
