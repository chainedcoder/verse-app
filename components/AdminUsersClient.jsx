"use client"

import { useState, useTransition, useMemo, useCallback } from "react"
import {
  updateUserStatus,
  updateUserRole,
  deleteUserNuclear,
  deleteUsersNuclearBulk
} from "@/app/actions/admin"
import Link from "next/link"
import Avatar from "./Avatar"
import Pagination from "./Pagination"

const ITEMS_PER_PAGE = 10

function SortIcon({ direction }) {
  if (!direction) return <span className="adt-sort-icon">⇅</span>
  return <span className="adt-sort-icon">{direction === "asc" ? "↑" : "↓"}</span>
}

const STATUS_CONFIG = {
  ACTIVE:    { label: "Active",    cls: "adt-status--active" },
  SUSPENDED: { label: "Suspended", cls: "adt-status--suspended" },
  BANNED:    { label: "Banned",    cls: "adt-status--banned" },
}

const ROLE_CONFIG = {
  USER:      { label: "User",      cls: "adt-role--user" },
  MODERATOR: { label: "Mod",       cls: "adt-role--moderator" },
  ADMIN:     { label: "Admin",     cls: "adt-role--admin" },
}

function StatusDropdown({ userId, status, disabled, onChange }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE

  return (
    <div className="adt-status-wrap">
      <button
        className={`adt-status ${cfg.cls}`}
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        aria-label={`Status for user: ${cfg.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="adt-status-dot" />
        {cfg.label}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setOpen(false)} />
          <div className="adt-status-menu" role="listbox" style={{ zIndex: 101 }}>
            {Object.entries(STATUS_CONFIG).map(([val, c]) => (
              <button
                key={val}
                role="option"
                aria-selected={val === status}
                className={`adt-status-option ${val === status ? "adt-status-option--active" : ""}`}
                onClick={() => { onChange(userId, val); setOpen(false) }}
                type="button"
              >
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RoleDropdown({ userId, role, disabled, onChange }) {
  const [open, setOpen] = useState(false)
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.USER

  return (
    <div className="adt-status-wrap">
      <button
        className={`adt-role ${cfg.cls}`}
        onClick={() => !disabled && setOpen(v => !v)}
        disabled={disabled}
        aria-label={`Role for user: ${cfg.label}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        {cfg.label}
        {!disabled && <span className="adt-role-caret">▾</span>}
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 100 }} onClick={() => setOpen(false)} />
          <div className="adt-role-menu" role="listbox" style={{ zIndex: 101 }}>
            {Object.entries(ROLE_CONFIG).map(([val, c]) => (
              <button
                key={val}
                role="option"
                aria-selected={val === role}
                className={`adt-role-option ${val === role ? "adt-role-option--active" : ""}`}
                onClick={() => { onChange(userId, val); setOpen(false) }}
                type="button"
              >
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ConfirmBulkDeleteModal({ users, onConfirm, onCancel, isPending }) {
  const [confirmText, setConfirmText] = useState("")
  const userList = users.map(u => `${u.name || "Unknown"} (${u.email || "no email"})`).join("\n")
  const isValid = confirmText.trim().toUpperCase() === "DELETE"

  return (
    <div
      className="adt-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <div className="adt-modal">
        <div className="adt-modal-stripe" />
        <div className="adt-modal-head">
          <span className="adt-modal-icon">⚠️</span>
          <h3 id="confirm-modal-title" className="adt-modal-title">
            Permanently Delete {users.length} User{users.length !== 1 ? "s" : ""}
          </h3>
          <p className="adt-modal-sub">
            This action is <strong>irreversible</strong>. All their poems, comments, likes, and data will be permanently removed.
          </p>
        </div>

        <div className="adt-modal-body">
          <label className="adt-modal-label">
            Accounts to be deleted ({users.length}):
          </label>
          <textarea
            className="adt-modal-textarea"
            readOnly
            value={userList}
            rows={Math.min(users.length + 1, 6)}
            aria-label="List of accounts to be deleted"
          />

          <label className="adt-modal-label" htmlFor="delete-confirm-input">
            Type <strong>DELETE</strong> to confirm:
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            className="adt-modal-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE here"
            autoComplete="off"
            autoFocus
          />
        </div>

        <div className="adt-modal-foot">
          <button className="adt-modal-cancel" onClick={onCancel} disabled={isPending}>
            Cancel
          </button>
          <button
            className="adt-modal-confirm"
            onClick={() => isValid && onConfirm()}
            disabled={!isValid || isPending}
          >
            {isPending ? "Deleting…" : `Permanently Delete ${users.length} User${users.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersClient({ initialUsers, currentUserRole }) {
  const [users, setUsers] = useState(initialUsers)
  const [isPending, startTransition] = useTransition()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [sortKey, setSortKey] = useState("createdAt")
  const [sortDir, setSortDir] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkError, setBulkError] = useState("")

  const handleSort = useCallback((key) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
    setCurrentPage(1)
  }, [sortKey])

  const filteredSortedUsers = useMemo(() => {
    let result = users.filter(u => {
      const q = searchTerm.toLowerCase()
      const matchSearch = !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter
      const matchRole = roleFilter === "ALL" || u.role === roleFilter
      return matchSearch && matchStatus && matchRole
    })

    result = [...result].sort((a, b) => {
      let av, bv
      switch (sortKey) {
        case "name":   av = (a.name || "").toLowerCase(); bv = (b.name || "").toLowerCase(); break
        case "email":  av = (a.email || "").toLowerCase(); bv = (b.email || "").toLowerCase(); break
        case "status": av = a.status; bv = b.status; break
        case "role":   av = a.role; bv = b.role; break
        case "poems":  av = a._count.poems; bv = b._count.poems; break
        case "reports": av = a._count.reportsReceived; bv = b._count.reportsReceived; break
        default:       av = a.createdAt || ""; bv = b.createdAt || ""
      }
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [users, searchTerm, statusFilter, roleFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredSortedUsers.length / ITEMS_PER_PAGE)
  const paginatedUsers = filteredSortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const allPageSelected = paginatedUsers.length > 0 && paginatedUsers.every(u => selectedIds.has(u.id))
  const somePageSelected = paginatedUsers.some(u => selectedIds.has(u.id))

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allPageSelected) paginatedUsers.forEach(u => next.delete(u.id))
      else paginatedUsers.forEach(u => next.add(u.id))
      return next
    })
  }

  const toggleSelectUser = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedUsers = users.filter(u => selectedIds.has(u.id))

  const handleStatusChange = (userId, newStatus) => {
    startTransition(async () => {
      const res = await updateUserStatus(userId, newStatus)
      if (res.success) setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u))
      else alert(res.error)
    })
  }

  const handleRoleChange = (userId, newRole) => {
    if (currentUserRole !== "ADMIN") { alert("Only Administrators can change roles."); return }
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res.success) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      else alert(res.error)
    })
  }

  const handleNuclearDelete = (userId, userName) => {
    if (currentUserRole !== "ADMIN") { alert("Only Administrators can permanently delete users."); return }
    if (!confirm(`NUCLEAR OPTION: Permanently delete "${userName}" and ALL their content? Cannot be undone.`)) return
    startTransition(async () => {
      const res = await deleteUserNuclear(userId)
      if (res.success) {
        setUsers(prev => prev.filter(u => u.id !== userId))
        setSelectedIds(prev => { const n = new Set(prev); n.delete(userId); return n })
      } else { alert(res.error) }
    })
  }

  const handleBulkConfirm = () => {
    startTransition(async () => {
      const ids = [...selectedIds]
      const res = await deleteUsersNuclearBulk(ids)
      if (res.success) {
        setUsers(prev => prev.filter(u => !ids.includes(u.id)))
        setSelectedIds(new Set())
        setShowBulkModal(false)
        setBulkError("")
      } else { setBulkError(res.error) }
    })
  }

  const thProps = (key, label) => ({
    className: `adt-th adt-th--sortable${sortKey === key ? " adt-th--sorted" : ""}`,
    onClick: () => handleSort(key),
    role: "button",
    tabIndex: 0,
    onKeyDown: (e) => (e.key === "Enter" || e.key === " ") && handleSort(key),
    "aria-sort": sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none",
    children: (
      <span className="adt-th-inner">
        {label}
        <SortIcon direction={sortKey === key ? sortDir : null} />
      </span>
    )
  })

  return (
    <div className="adt-root">
      {/* ── Toolbar ── */}
      <div className="adt-toolbar">
        <div className="adt-search">
          <svg className="adt-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="search"
            placeholder="Search by name or email…"
            className="adt-search-input"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            aria-label="Search users"
          />
        </div>
        <div className="adt-filters">
          <select
            className="adt-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
          </select>
          <select
            className="adt-select"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
            aria-label="Filter by role"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="MODERATOR">Moderator</option>
            <option value="ADMIN">Admin</option>
          </select>
          <span className="adt-count">
            {filteredSortedUsers.length} user{filteredSortedUsers.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="adt-container">
        <div className="adt-scroll">
          <table className="adt-table">
            <thead>
              <tr>
                <th className="adt-th adt-th--check">
                  <input
                    type="checkbox"
                    className="adt-checkbox"
                    checked={allPageSelected}
                    ref={el => { if (el) el.indeterminate = somePageSelected && !allPageSelected }}
                    onChange={toggleSelectAll}
                    aria-label="Select all users on page"
                    disabled={currentUserRole !== "ADMIN"}
                  />
                </th>
                <th {...thProps("name", "User")} />
                <th {...thProps("status", "Status")} />
                <th {...thProps("role", "Role")} />
                <th {...thProps("poems", "Poems")} />
                <th {...thProps("reports", "Reports")} />
                <th {...thProps("createdAt", "Joined")} />
                <th className="adt-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr
                  key={user.id}
                  className={`adt-row${selectedIds.has(user.id) ? " adt-row--selected" : ""}`}
                >
                  <td className="adt-td adt-td-check">
                    <input
                      type="checkbox"
                      className="adt-checkbox"
                      checked={selectedIds.has(user.id)}
                      onChange={() => toggleSelectUser(user.id)}
                      aria-label={`Select ${user.name}`}
                      disabled={currentUserRole !== "ADMIN"}
                    />
                  </td>

                  {/* User cell */}
                  <td className="adt-td">
                    <div className="adt-user-cell">
                      <Avatar image={user.image} name={user.name} size="sm" />
                      <div className="adt-user-text">
                        <Link href={`/author/${user.id}`} className="adt-user-name">
                          {user.name}
                        </Link>
                        <span className="adt-user-email" title={user.email}>
                          {user.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="adt-td">
                    <StatusDropdown
                      userId={user.id}
                      status={user.status}
                      disabled={isPending || (user.role === "ADMIN" && currentUserRole !== "ADMIN")}
                      onChange={handleStatusChange}
                    />
                  </td>

                  {/* Role */}
                  <td className="adt-td">
                    <RoleDropdown
                      userId={user.id}
                      role={user.role}
                      disabled={isPending || currentUserRole !== "ADMIN"}
                      onChange={handleRoleChange}
                    />
                  </td>

                  {/* Poems */}
                  <td className="adt-td adt-num">
                    {user._count.poems}
                  </td>

                  {/* Reports */}
                  <td className="adt-td adt-num">
                    {user._count.reportsReceived > 0 ? (
                      <span className="adt-num--warn">{user._count.reportsReceived}</span>
                    ) : (
                      <span className="adt-num--muted">—</span>
                    )}
                  </td>

                  {/* Joined */}
                  <td className="adt-td adt-meta">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>

                  {/* Actions */}
                  <td className="adt-td">
                    <div className="adt-actions">
                      <button
                        className="adt-btn adt-btn--warn"
                        onClick={() => handleStatusChange(user.id, user.status === "BANNED" ? "ACTIVE" : "BANNED")}
                        disabled={isPending || (user.role === "ADMIN" && currentUserRole !== "ADMIN")}
                        title={user.status === "BANNED" ? "Unban user" : "Ban user"}
                      >
                        {user.status === "BANNED" ? "Unban" : "Ban"}
                      </button>
                      {currentUserRole === "ADMIN" && (
                        <button
                          className="adt-btn adt-btn--danger"
                          onClick={() => handleNuclearDelete(user.id, user.name)}
                          disabled={isPending}
                          title="Permanently delete user"
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
            <div className="adt-empty">
              <div className="adt-empty-icon">👤</div>
              <div className="adt-empty-text">No users found matching your filters.</div>
            </div>
          )}
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* ── Selection Bar ── */}
      {selectedIds.size > 0 && currentUserRole === "ADMIN" && (
        <div className="adt-selection-bar" role="status" aria-live="polite">
          <span className="adt-bar-count">
            <strong>{selectedIds.size}</strong> user{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            className="adt-bar-clear"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </button>
          <button
            className="adt-bar-delete"
            onClick={() => { setBulkError(""); setShowBulkModal(true) }}
            disabled={isPending}
          >
            🗑&nbsp; Delete {selectedIds.size} User{selectedIds.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* ── Bulk Delete Modal ── */}
      {showBulkModal && (
        <ConfirmBulkDeleteModal
          users={selectedUsers}
          onConfirm={handleBulkConfirm}
          onCancel={() => { setShowBulkModal(false); setBulkError("") }}
          isPending={isPending}
        />
      )}
      {bulkError && (
        <div className="adt-error">{bulkError}</div>
      )}
    </div>
  )
}
