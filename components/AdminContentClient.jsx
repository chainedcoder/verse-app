"use client"

import { useState, useTransition, useMemo, useCallback } from "react"
import {
  togglePoemFeatured,
  deletePoemAdmin,
  deletePoemsAdminBulk
} from "@/app/actions/admin"
import Link from "next/link"
import Avatar from "./Avatar"
import Pagination from "./Pagination"

const ITEMS_PER_PAGE = 10

function SortIcon({ direction }) {
  if (!direction) return <span className="adt-sort-icon">⇅</span>
  return <span className="adt-sort-icon">{direction === "asc" ? "↑" : "↓"}</span>
}

function ConfirmBulkDeleteModal({ poems, onConfirm, onCancel, isPending }) {
  const [confirmText, setConfirmText] = useState("")
  const poemList = poems.map(p => p.title).join("\n")
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
            Delete {poems.length} Poem{poems.length !== 1 ? "s" : ""}
          </h3>
          <p className="adt-modal-sub">
            The selected poems will be marked as <strong>DELETED</strong> and hidden from all users.
          </p>
        </div>

        <div className="adt-modal-body">
          <label className="adt-modal-label">
            Poems to be deleted ({poems.length}):
          </label>
          <textarea
            className="adt-modal-textarea"
            readOnly
            value={poemList}
            rows={Math.min(poems.length + 1, 6)}
            aria-label="List of poems to be deleted"
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
            {isPending ? "Deleting…" : `Delete ${poems.length} Poem${poems.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminContentClient({ initialPoems, currentUserRole }) {
  const [poems, setPoems] = useState(initialPoems)
  const [isPending, startTransition] = useTransition()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [featuredFilter, setFeaturedFilter] = useState("ALL")
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

  const filteredSortedPoems = useMemo(() => {
    let result = poems.filter(p => {
      const q = searchTerm.toLowerCase()
      const matchSearch = !q ||
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || "").toLowerCase().includes(q) ||
        p.author?.name?.toLowerCase().includes(q)
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter
      const matchFeatured =
        featuredFilter === "ALL" ||
        (featuredFilter === "FEATURED" && p.featured) ||
        (featuredFilter === "NOT_FEATURED" && !p.featured)
      return matchSearch && matchStatus && matchFeatured
    })

    result = [...result].sort((a, b) => {
      let av, bv
      switch (sortKey) {
        case "title":    av = a.title.toLowerCase(); bv = b.title.toLowerCase(); break
        case "author":   av = (a.author?.name || "").toLowerCase(); bv = (b.author?.name || "").toLowerCase(); break
        case "status":   av = a.status; bv = b.status; break
        case "featured": av = a.featured ? 1 : 0; bv = b.featured ? 1 : 0; break
        default:         av = a.createdAt || ""; bv = b.createdAt || ""
      }
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv))
      return sortDir === "asc" ? cmp : -cmp
    })

    return result
  }, [poems, searchTerm, statusFilter, featuredFilter, sortKey, sortDir])

  const totalPages = Math.ceil(filteredSortedPoems.length / ITEMS_PER_PAGE)
  const paginatedPoems = filteredSortedPoems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const allPageSelected = paginatedPoems.length > 0 && paginatedPoems.every(p => selectedIds.has(p.id))
  const somePageSelected = paginatedPoems.some(p => selectedIds.has(p.id))

  const toggleSelectAll = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (allPageSelected) paginatedPoems.forEach(p => next.delete(p.id))
      else paginatedPoems.forEach(p => next.add(p.id))
      return next
    })
  }

  const toggleSelectPoem = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedPoems = poems.filter(p => selectedIds.has(p.id))

  const handleToggleFeature = (poemId, currentFeatured) => {
    startTransition(async () => {
      const res = await togglePoemFeatured(poemId, !currentFeatured)
      if (res.success) setPoems(prev => prev.map(p => p.id === poemId ? { ...p, featured: !currentFeatured } : p))
      else alert(res.error)
    })
  }

  const handleDelete = (poemId) => {
    if (!confirm("Are you sure you want to delete this poem?")) return
    startTransition(async () => {
      const res = await deletePoemAdmin(poemId)
      if (res.success) {
        setPoems(prev => prev.map(p => p.id === poemId ? { ...p, status: "DELETED" } : p))
        setSelectedIds(prev => { const n = new Set(prev); n.delete(poemId); return n })
      } else alert(res.error)
    })
  }

  const handleBulkConfirm = () => {
    startTransition(async () => {
      const ids = [...selectedIds]
      const res = await deletePoemsAdminBulk(ids)
      if (res.success) {
        setPoems(prev => prev.map(p => ids.includes(p.id) ? { ...p, status: "DELETED" } : p))
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
            placeholder="Search poems by title, excerpt, or author…"
            className="adt-search-input"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            aria-label="Search poems"
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
            <option value="PUBLISHED">Published</option>
            <option value="DELETED">Deleted</option>
            <option value="DRAFT">Draft</option>
          </select>
          <select
            className="adt-select"
            value={featuredFilter}
            onChange={(e) => { setFeaturedFilter(e.target.value); setCurrentPage(1) }}
            aria-label="Filter by featured"
          >
            <option value="ALL">All</option>
            <option value="FEATURED">Featured</option>
            <option value="NOT_FEATURED">Not Featured</option>
          </select>
          <span className="adt-count">
            {filteredSortedPoems.length} poem{filteredSortedPoems.length !== 1 ? "s" : ""}
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
                    aria-label="Select all poems on page"
                  />
                </th>
                <th {...thProps("title", "Poem")} />
                <th {...thProps("author", "Author")} />
                <th {...thProps("status", "Status")} />
                <th {...thProps("featured", "Featured")} />
                <th {...thProps("createdAt", "Date")} />
                <th className="adt-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPoems.map(poem => (
                <tr
                  key={poem.id}
                  className={`adt-row${selectedIds.has(poem.id) ? " adt-row--selected" : ""}${poem.status === "DELETED" ? " adt-row--faded" : ""}`}
                >
                  <td className="adt-td adt-td-check">
                    <input
                      type="checkbox"
                      className="adt-checkbox"
                      checked={selectedIds.has(poem.id)}
                      onChange={() => toggleSelectPoem(poem.id)}
                      aria-label={`Select poem: ${poem.title}`}
                    />
                  </td>

                  {/* Poem cell */}
                  <td className="adt-td">
                    <div className="adt-poem-cell">
                      <Link href={`/poem/${poem.id}`} className="adt-poem-title">
                        {poem.title}
                      </Link>
                      <div className="adt-poem-excerpt">
                        {poem.excerpt}
                      </div>
                    </div>
                  </td>

                  {/* Author cell */}
                  <td className="adt-td">
                    <div className="adt-author-cell">
                      <Avatar image={poem.author.image} name={poem.author.name} size="sm" />
                      <Link href={`/author/${poem.author.id}`} className="adt-author-name">
                        {poem.author.name}
                      </Link>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="adt-td">
                    <span className={`adt-status adt-status--${poem.status.toLowerCase()}`}>
                      <span className="adt-status-dot" />
                      {poem.status}
                    </span>
                  </td>

                  {/* Featured */}
                  <td className="adt-td">
                    {poem.featured ? (
                      <span className="adt-featured">FEATURED</span>
                    ) : (
                      <span className="adt-num--muted">—</span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="adt-td adt-meta">
                    {poem.createdAt ? new Date(poem.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </td>

                  {/* Actions */}
                  <td className="adt-td">
                    <div className="adt-actions">
                      <button
                        className="adt-btn adt-btn--star"
                        onClick={() => handleToggleFeature(poem.id, poem.featured)}
                        disabled={isPending || poem.status === "DELETED"}
                      >
                        {poem.featured ? "Unfeature" : "Feature"}
                      </button>
                      <button
                        className="adt-btn adt-btn--danger"
                        onClick={() => handleDelete(poem.id)}
                        disabled={isPending || poem.status === "DELETED"}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {paginatedPoems.length === 0 && (
            <div className="adt-empty">
              <div className="adt-empty-icon">📜</div>
              <div className="adt-empty-text">No poems found matching your filters.</div>
            </div>
          )}
        </div>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {/* ── Selection Bar ── */}
      {selectedIds.size > 0 && (
        <div className="adt-selection-bar" role="status" aria-live="polite">
          <span className="adt-bar-count">
            <strong>{selectedIds.size}</strong> poem{selectedIds.size !== 1 ? "s" : ""} selected
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
            🗑&nbsp; Delete {selectedIds.size} Poem{selectedIds.size !== 1 ? "s" : ""}
          </button>
        </div>
      )}

      {/* ── Bulk Delete Modal ── */}
      {showBulkModal && (
        <ConfirmBulkDeleteModal
          poems={selectedPoems}
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
