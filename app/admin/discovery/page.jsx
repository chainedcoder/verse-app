import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminDiscoveryPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <div className="card" style={{ padding: "32px", animation: "fade-in 0.3s ease-out" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>
        Algorithm & Discovery
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        
        {/* Recommendation Weights */}
        <div>
          <h3 style={{ fontSize: "16px", marginBottom: "8px" }}>Recommendation Engine Weights</h3>
          <p style={{ fontSize: "12px", color: "var(--text-tertiary)", marginBottom: "24px" }}>
            Adjust the global weights used by the feed algorithm to rank content.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { label: "Recency (Time Decay)", value: 40 },
              { label: "Engagement (Likes/Comments)", value: 50 },
              { label: "Author Reputation", value: 10 },
            ].map((weight, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                  <span style={{ fontWeight: 500 }}>{weight.label}</span>
                  <span style={{ color: "var(--primary)", fontWeight: 600 }}>{weight.value}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue={weight.value} 
                  style={{ width: "100%", accentColor: "var(--primary)" }} 
                />
              </div>
            ))}
          </div>

          <button className="btn btn-primary" style={{ marginTop: "24px", width: "100%" }}>Update Algorithm</button>
        </div>

        {/* Trending Dashboard Mock */}
        <div>
          <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Current Trends</h3>
          <div style={{ backgroundColor: "var(--bg-secondary)", borderRadius: "12px", padding: "16px", border: "1px solid var(--border-tertiary)", height: "300px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, transparent 100%)" }}></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-tertiary)", paddingBottom: "12px", marginBottom: "12px" }}>
              <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>TRENDING TAGS</span>
              <span style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>VELOCITY</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {["#poetry", "#love", "#nature", "#haiku"].map((tag, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", fontWeight: 500 }}>{tag}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: `${Math.random() * 60 + 20}px`, height: "6px", backgroundColor: "var(--primary)", borderRadius: "4px", opacity: 0.8 - i * 0.15 }}></div>
                    <i className="ti ti-trending-up" style={{ color: "var(--primary)", fontSize: "12px" }}></i>
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
