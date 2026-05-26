export default function AuthorLoading() {
  return (
    <div className="page-container">
      {/* Profile Header Skeleton */}
      <div className="card" style={{ padding: "32px", textAlign: "center", marginBottom: "32px" }}>
        <div 
          className="skeleton" 
          style={{ 
            width: "80px", 
            height: "80px", 
            borderRadius: "50%", 
            margin: "0 auto 16px auto" 
          }}
        ></div>
        
        <div 
          className="skeleton" 
          style={{ height: "28px", width: "150px", margin: "0 auto 12px auto" }}
        ></div>
        
        <div 
          className="skeleton" 
          style={{ height: "16px", width: "200px", margin: "0 auto 24px auto" }}
        ></div>

        <div style={{ display: "flex", justifyContent: "center", gap: "24px" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div className="skeleton" style={{ height: "20px", width: "30px", marginBottom: "8px" }}></div>
              <div className="skeleton" style={{ height: "12px", width: "60px" }}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Poems Grid Skeleton */}
      <div style={{ marginBottom: "24px" }}>
        <div className="skeleton" style={{ height: "24px", width: "120px" }}></div>
      </div>
      
      <div className="poem-list-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card" style={{ height: "200px" }}>
            <div className="skeleton" style={{ height: "16px", width: "80px", marginBottom: "16px" }}></div>
            <div className="skeleton" style={{ height: "24px", width: "80%", marginBottom: "16px" }}></div>
            <div className="skeleton" style={{ height: "60px", width: "100%", marginBottom: "auto" }}></div>
            <div className="skeleton" style={{ height: "14px", width: "120px", marginTop: "24px" }}></div>
          </div>
        ))}
      </div>
    </div>
  )
}
