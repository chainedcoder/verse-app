"use client"

import { useState, useTransition } from "react"
import { updateUserStatus, updateUserRole, deleteUserNuclear } from "@/app/actions/admin"
import Link from "next/link"
import Avatar from "./Avatar"
import Pagination from "./Pagination"

const ITEMS_PER_PAGE = 10

export default function AdminUsersClient({ initialUsers, currentUserRole }) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleStatusChange = (userId, newStatus) => {
    startTransition(async () => {
      const res = await updateUserStatus(userId, newStatus)
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      } else {
        alert(res.error)
      }
    })
  }

  const handleNuclearDelete = (userId, userName) => {
    if (currentUserRole !== "ADMIN") {
      alert("Only Administrators can permanently delete users.")
      return
    }

    if (!confirm(`NUCLEAR OPTION: Are you sure you want to permanently delete user "${userName}" and ALL of their content? This cannot be undone.`)) return

    startTransition(async () => {
      const res = await deleteUserNuclear(userId)
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
      } else {
        alert(res.error)
      }
    })
  }

  const handleRoleChange = (userId, newRole) => {
    if (currentUserRole !== "ADMIN") {
      alert("Only Administrators can change roles.")
      return
    }
    
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
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
          placeholder="Search by name or email..." 
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
              <th style={{ padding: "12px 8px" }}>User</th>
              <th style={{ padding: "12px 8px" }}>Status</th>
              <th style={{ padding: "12px 8px" }}>Role</th>
              <th style={{ padding: "12px 8px" }}>Stats</th>
              <th style={{ padding: "12px 8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: "1px solid var(--border-tertiary)" }}>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Avatar image={user.image} name={user.name} size="sm" />
                    <div>
                      <Link href={`/author/${user.id}`} style={{ fontWeight: "600", color: "var(--primary)", textDecoration: "none" }}>{user.name}</Link>
                      <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>{user.email || "No email"}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <select 
                    className="input" 
                    value={user.status} 
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    disabled={isPending || (user.role === "ADMIN" && currentUserRole !== "ADMIN")}
                    style={{ 
                      padding: "4px 8px", fontSize: "12px", height: "auto",
                      backgroundColor: user.status === "BANNED" ? "var(--danger)" : user.status === "SUSPENDED" ? "orange" : "var(--bg-secondary)",
                      color: user.status === "BANNED" ? "white" : "inherit"
                    }}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                    <option value="BANNED">Banned</option>
                  </select>
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <select 
                    className="input" 
                    value={user.role} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={isPending || currentUserRole !== "ADMIN"}
                    style={{ padding: "4px 8px", fontSize: "12px", height: "auto" }}
                  >
                    <option value="USER">User</option>
                    <option value="MODERATOR">Moderator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td style={{ padding: "12px 8px", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <div>Poems: {user._count.poems}</div>
                  {user._count.reportsReceived > 0 && (
                    <div style={{ color: "var(--danger)", fontWeight: "600" }}>Reports: {user._count.reportsReceived}</div>
                  )}
                </td>
                <td style={{ padding: "12px 8px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: "var(--danger)", fontSize: "12px", padding: "4px 8px" }}
                      onClick={() => handleStatusChange(user.id, "BANNED")}
                      disabled={isPending || user.status === "BANNED" || (user.role === "ADMIN" && currentUserRole !== "ADMIN")}
                    >
                      Quick Ban
                    </button>
                    {currentUserRole === "ADMIN" && (
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ color: "var(--danger)", fontSize: "12px", padding: "4px 8px" }}
                        onClick={() => handleNuclearDelete(user.id, user.name)}
                        disabled={isPending}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {paginatedUsers.length === 0 && (
          <div className="empty-state" style={{ padding: "32px 0" }}>No users found.</div>
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  )
}
