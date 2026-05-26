export default function Loading() {
  return (
    <div className="page-container">
      {/* Featured Strip Skeleton */}
      <div style={{ marginBottom: "32px" }}>
        <div className="skeleton" style={{ height: "24px", width: "120px", marginBottom: "16px" }}></div>
        <div className="tag-row-scroll">
          <div className="skeleton" style={{ height: "180px", width: "280px", borderRadius: "12px", flexShrink: 0 }}></div>
          <div className="skeleton" style={{ height: "180px", width: "280px", borderRadius: "12px", flexShrink: 0 }}></div>
          <div className="skeleton" style={{ height: "180px", width: "280px", borderRadius: "12px", flexShrink: 0 }}></div>
        </div>
      </div>

      <div className="feed-layout">
        {/* Main Feed Skeleton */}
        <div className="feed-main">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card" style={{ marginBottom: "16px" }}>
              <div className="skeleton" style={{ height: "16px", width: "100px", marginBottom: "12px" }}></div>
              <div className="skeleton" style={{ height: "28px", width: "70%", marginBottom: "16px" }}></div>
              <div className="skeleton" style={{ height: "60px", width: "100%", marginBottom: "24px" }}></div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div className="skeleton" style={{ height: "32px", width: "32px", borderRadius: "50%" }}></div>
                  <div>
                    <div className="skeleton" style={{ height: "14px", width: "80px", marginBottom: "6px" }}></div>
                    <div className="skeleton" style={{ height: "12px", width: "60px" }}></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Skeleton */}
        <div className="feed-sidebar">
          <div className="card">
            <div className="skeleton" style={{ height: "20px", width: "120px", marginBottom: "16px" }}></div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div className="skeleton" style={{ height: "40px", width: "40px", borderRadius: "50%" }}></div>
                  <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: "14px", width: "80%", marginBottom: "6px" }}></div>
                    <div className="skeleton" style={{ height: "12px", width: "40%" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
