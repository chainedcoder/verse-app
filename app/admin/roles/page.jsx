import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AdminRolesClient from "@/components/AdminRolesClient"

const SEED_GROUPS = [
  {
    name: "Super Administrator",
    color: "#ef4444",
    permissions: {
      user: ["View User", "Edit User", "Reset Password", "Create User", "Delete User"],
      poem: ["View Poem", "Edit Poem", "Create Poem", "Delete Poem"],
      tag: ["View Tag", "Edit Tag", "Create Tag", "Delete Tag"],
      report: ["View Reports", "Resolve Reports", "Dismiss Reports"],
      role: ["View Role", "Edit Role", "Create Role", "Delete Role"],
      system: ["Manage Ads", "Change Algorithms", "System Settings", "View Revenue"]
    }
  },
  {
    name: "Permissions Supervisor",
    color: "#8b5cf6",
    permissions: {
      user: ["View User", "Edit User", "Reset Password"],
      tag: ["View Tag", "Edit Tag", "Create Tag"]
    }
  },
  {
    name: "Requests Supervisor",
    color: "#10b981",
    permissions: {
      report: ["View Reports", "Resolve Reports", "Dismiss Reports"],
      poem: ["View Poem", "Edit Poem"]
    }
  },
  {
    name: "Bills Supervisor",
    color: "#f59e0b",
    permissions: {
      system: ["View Revenue"]
    }
  },
  {
    name: "User",
    color: "#64748b",
    permissions: {
      user: ["View User"],
      poem: ["View Poem"]
    }
  }
]

export default async function AdminRolesPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  const db = prisma

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  if (user?.role !== "ADMIN") {
    return <div style={{ padding: "32px", fontSize: "16px", fontWeight: "600", color: "#b91c1c" }}>Access Denied: Enterprise Admin only.</div>
  }

  // Fetch or Seed groups
  let groups = await db.permissionGroup.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { users: true } } }
  })

  if (groups.length === 0) {
    // DB is empty, let's seed automatically
    for (const seed of SEED_GROUPS) {
      await db.permissionGroup.create({
        data: {
          name: seed.name,
          color: seed.color,
          permissions: seed.permissions
        }
      })
    }
    // Re-fetch seeded groups
    groups = await db.permissionGroup.findMany({
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { users: true } } }
    })
  }

  return (
    <AdminRolesClient initialGroups={JSON.parse(JSON.stringify(groups))} />
  )
}
