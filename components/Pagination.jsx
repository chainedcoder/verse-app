"use client"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "24px", padding: "16px 0", borderTop: "1px solid var(--border-secondary)" }}>
      <button 
        className="btn btn-ghost btn-sm" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <i className="ti ti-chevron-left"></i> Prev
      </button>
      
      <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
        Page {currentPage} of {totalPages}
      </span>
      
      <button 
        className="btn btn-ghost btn-sm" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next <i className="ti ti-chevron-right"></i>
      </button>
    </div>
  )
}
