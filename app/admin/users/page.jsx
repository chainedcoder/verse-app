// Force HMR 9
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AdminUsersClient from "@/components/AdminUsersClient"

export default async function AdminUsersPage(props) {
  const searchParams = await props.searchParams
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  const db = prisma
  
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  // Read raw parameters with robust fallbacks
  const search = searchParams?.search || ""
  const role = searchParams?.role || "ALL"
  const status = searchParams?.status || "ALL"
  const mfa = searchParams?.mfa || "ALL"
  const sortKey = searchParams?.sortKey || "createdAt"
  const sortDir = searchParams?.sortDir || "desc"
  const page = Number(searchParams?.page) || 1
  const viewMode = searchParams?.viewMode || "table"
  const limit = viewMode === "board" ? 300 : (Number(searchParams?.limit) || 15)

  // Build the dynamic where clause for database-level filtering
  const where = {
    id: { not: session.user.id },
    ...(search ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(role !== "ALL" ? { role } : {}),
    ...(status !== "ALL" ? { status } : { status: { not: "DELETED" } }),
    ...(mfa !== "ALL" ? { mfaEnabled: mfa === "ENABLED" } : {})
  }

  // Get total count at the database level for pagination calculations
  const totalCount = await db.user.count({ where })

  // Fetch only the relevant paginated slice from the database
  const users = await db.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      deletedAt: true,
      mfaEnabled: true,
      createdAt: true,
      _count: { select: { poems: true, reportsReceived: true } }
    },
    orderBy: { [sortKey]: sortDir },
    skip: (page - 1) * limit,
    take: limit
  })

  // Fetch or auto-seed custom permission groups
  let permissionGroups = await db.permissionGroup.findMany({
    orderBy: { createdAt: "asc" }
  })

  if (permissionGroups.length === 0) {
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
    for (const seed of SEED_GROUPS) {
      await db.permissionGroup.create({
        data: {
          name: seed.name,
          color: seed.color,
          permissions: seed.permissions
        }
      })
    }
    permissionGroups = await db.permissionGroup.findMany({
      orderBy: { createdAt: "asc" }
    })
  }

  return (
    <AdminUsersClient 
      initialUsers={JSON.parse(JSON.stringify(users || []))} 
      currentUserRole={currentUser.role}
      totalCount={totalCount}
      currentPage={page}
      itemsPerPage={limit}
      viewMode={viewMode}
      permissionGroups={JSON.parse(JSON.stringify(permissionGroups || []))}
    />
  )
}
