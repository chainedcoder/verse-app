"use client"

import { useState, useTransition, useEffect } from "react"
import { togglePoemInCollection, deleteCollection, updateCollection, restoreCollection } from "@/app/actions/collections"
import { searchPoems } from "@/app/actions/poems"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ToastProvider"

export default function CollectionManager({ collection, allUserPoems }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("my_poems") // my_poems, search, edit

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  
  const { showUndoToast } = useToast()
  
  const [editError, setEditError] = useState(null)

  const collectionPoemIds = new Set(collection.poems.map(p => p.id))

  const handleToggle = (poemId) => {
    startTransition(async () => {
      await togglePoemInCollection(collection.id, poemId)
    })
  }

  const handleDeleteCollection = () => {
    setShowConfirmDelete(true)
  }

  const confirmDelete = () => {
    setShowConfirmDelete(false)
    startTransition(async () => {
      await deleteCollection(collection.id)
      showUndoToast("Collection deleted", async () => {
        await restoreCollection(collection.id)
      })
      router.push('/collections')
    })
  }
  
  const handleEditSubmit = (e) => {
    e.preventDefault()
    setEditError(null)
    const formData = new FormData(e.target)
    startTransition(async () => {
      const result = await updateCollection(collection.id, formData)
      if (result?.error) {
        setEditError(result.error)
      } else {
        setShowAddModal(false)
      }
    })
  }

  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayFn = setTimeout(async () => {
        setIsSearching(true)
        const res = await searchPoems(searchQuery)
        setSearchResults(res.poems || [])
        setIsSearching(false)
      }, 300)
      return () => clearTimeout(delayFn)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const renderPoemList = (poemsToRender, emptyMsg) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {poemsToRender.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "20px" }}>{emptyMsg}</p>
      ) : (
        poemsToRender.map(poem => {
          const isInCollection = collectionPoemIds.has(poem.id)
          return (
            <div key={poem.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px", border: "1px solid var(--border-secondary)",
              borderRadius: "8px", backgroundColor: isInCollection ? "var(--bg-secondary)" : "transparent"
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{poem.title}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                  {poem.author ? `by ${poem.author.name}` : poem.status}
                </span>
              </div>
              <button 
                onClick={() => handleToggle(poem.id)}
                disabled={isPending}
                className={`btn btn-sm ${isInCollection ? "btn-ghost" : "btn-primary"}`}
                style={{ padding: "6px 12px", fontSize: "13px" }}
              >
                {isInCollection ? "Remove" : "Add"}
              </button>
            </div>
          )
        })
      )}
    </div>
  )

  return (
    <div style={{ marginBottom: "32px", display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
      <button 
        className="btn btn-primary btn-sm" 
        onClick={() => { setActiveTab("my_poems"); setShowAddModal(true); }}
      >
        <i className="ti ti-plus"></i> Manage Poems
      </button>

      <button 
        className="btn btn-ghost btn-sm" 
        onClick={() => { setActiveTab("edit"); setShowAddModal(true); }}
      >
        <i className="ti ti-edit"></i> Edit Details
      </button>
      
      <button 
        className="btn btn-ghost btn-sm" 
        onClick={handleDeleteCollection}
        disabled={isPending || isDeleting}
        style={{ color: "var(--danger)" }}
      >
        <i className="ti ti-trash"></i> Delete Collection
      </button>

      {showAddModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", backdropFilter: "blur(4px)"
        }} onClick={() => setShowAddModal(false)}>
          <div style={{
            backgroundColor: "var(--bg-card)", borderRadius: "12px",
            width: "100%", maxWidth: "500px", maxHeight: "80vh",
            display: "flex", flexDirection: "column",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border-secondary)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 className="serif" style={{ margin: 0, fontSize: "20px" }}>Collection Settings</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--text-tertiary)" }}>&times;</button>
            </div>
            
            <div style={{ display: "flex", borderBottom: "1px solid var(--border-secondary)" }}>
              <button onClick={() => setActiveTab("my_poems")} className={`tab-item ${activeTab === "my_poems" ? "active" : ""}`} style={{ flex: 1, padding: "12px", textAlign: "center", fontSize: "14px" }}>My Poems</button>
              <button onClick={() => setActiveTab("search")} className={`tab-item ${activeTab === "search" ? "active" : ""}`} style={{ flex: 1, padding: "12px", textAlign: "center", fontSize: "14px" }}>Search All</button>
              <button onClick={() => setActiveTab("edit")} className={`tab-item ${activeTab === "edit" ? "active" : ""}`} style={{ flex: 1, padding: "12px", textAlign: "center", fontSize: "14px" }}>Edit Details</button>
            </div>

            <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
              {activeTab === "my_poems" && renderPoemList(allUserPoems, "You don't have any poems yet.")}
              
              {activeTab === "search" && (
                <div>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Search poems by title or author..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "100%", marginBottom: "16px" }}
                  />
                  {isSearching ? (
                    <div style={{ textAlign: "center", padding: "20px", color: "var(--text-tertiary)" }}>
                      <i className="ti ti-loader-2" style={{ animation: "spin 1s linear infinite", fontSize: "24px" }}></i>
                    </div>
                  ) : (
                    renderPoemList(searchResults, searchQuery.length > 2 ? "No poems found." : "Type to search for poems...")
                  )}
                </div>
              )}

              {activeTab === "edit" && (
                <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {editError && (
                    <div className="form-error"><i className="ti ti-alert-circle"></i> {editError}</div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Collection Name</label>
                    <input type="text" name="name" className="input" defaultValue={collection.name} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea name="description" className="input" defaultValue={collection.description || ""} rows={3} style={{ resize: "vertical" }} />
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input type="checkbox" name="isPublic" value="true" defaultChecked={collection.isPublic} />
                    <label style={{ fontSize: "14px" }}>Make collection public</label>
                  </div>
                  <div style={{ marginTop: "16px", textAlign: "right" }}>
                    <button type="submit" className="btn btn-primary" disabled={isPending}>
                      {isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {showConfirmDelete && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px", backdropFilter: "blur(4px)"
        }}>
          <div className="card" style={{ padding: "32px", maxWidth: "400px", width: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: "#ef4444", fontSize: "28px" }}>
              <i className="ti ti-alert-triangle"></i>
            </div>
            <h3 className="serif" style={{ fontSize: "24px", marginBottom: "12px" }}>Delete Collection</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px", lineHeight: 1.5 }}>
              Are you sure you want to delete this collection? The poems inside will not be deleted, but the collection itself will be removed permanently.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowConfirmDelete(false)} disabled={isDeleting}>Cancel</button>
              <button type="button" className="btn btn-primary" style={{ backgroundColor: "#ef4444", borderColor: "#ef4444", color: "white" }} onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Yes, delete it"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
