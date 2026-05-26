export default function PoemLoading() {
  return (
    <div className="page-container poem-page-container">
      {/* Poem Header Skeleton */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div 
          className="skeleton" 
          style={{ height: "40px", width: "70%", margin: "0 auto 16px auto" }}
        ></div>
        
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "24px" }}>
          <div className="skeleton" style={{ height: "24px", width: "80px", borderRadius: "100px" }}></div>
          <div className="skeleton" style={{ height: "24px", width: "80px", borderRadius: "100px" }}></div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "12px" }}>
          <div className="skeleton" style={{ height: "32px", width: "32px", borderRadius: "50%" }}></div>
          <div className="skeleton" style={{ height: "14px", width: "100px" }}></div>
        </div>
      </div>

      {/* Poem Body Skeleton */}
      <div className="poem-content" style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>
        {[...Array(3)].map((_, stanzaIndex) => (
          <div key={stanzaIndex} style={{ marginBottom: "32px" }}>
            {[...Array(4)].map((_, lineIndex) => (
              <div 
                key={lineIndex} 
                className="skeleton" 
                style={{ 
                  height: "18px", 
                  width: `${Math.floor(Math.random() * 30) + 50}%`, 
                  marginBottom: "12px" 
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
