import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export const metadata = {
  title: "Admin Dashboard | Verse"
}

export default async function AdminLayout({ children }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true }
  })

  if (!user || user.status === "BANNED" || !["ADMIN", "MODERATOR"].includes(user.role)) {
    redirect("/") // Unauthorized users are booted to the home page
  }

  return (
    <div className="container" style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "32px" }}>
        <h1 className="serif" style={{ fontSize: "32px", letterSpacing: "-0.5px", margin: 0 }}>
          Admin Dashboard
        </h1>
        <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--primary)", backgroundColor: "var(--bg-secondary)", padding: "4px 12px", borderRadius: "100px" }}>
          {user.role}
        </span>
      </div>
      
      <div style={{ display: "flex", gap: "32px", flexDirection: "row", alignItems: "flex-start" }} className="admin-layout">
        <style>{`
          @media (max-width: 768px) {
            .admin-layout {
              flex-direction: column !important;
            }
            .admin-nav {
              width: 100% !important;
              flex-direction: row !important;
              overflow-x: auto;
              padding-bottom: 8px;
            }
          }
        `}</style>
        
        <nav className="admin-nav" style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "8px", 
          width: "220px",
          flexShrink: 0
        }}>
          <Link href="/admin" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-flag"></i> Reports Queue
          </Link>
          <Link href="/admin/users" className="btn btn-ghost" style={{ justifyContent: "flex-start" }}>
            <i className="ti ti-users"></i> User Management
          </Link>
        </nav>
        
        <div style={{ flex: 1, width: "100%" }}>
          {children}
        </div>
      </div>
    </div>
  )
}
