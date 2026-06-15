// Force HMR 9
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import AdminUsersClient from "@/components/AdminUsersClient"

export default async function AdminUsersPage(props) {
  const searchParams = await props.searchParams
  const session = await auth()
  
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })

  // Read raw parameters with robust fallbacks
  const search = searchParams?.search || ""
  const role = searchParams?.role || "ALL"
  const status = searchParams?.status || "ALL"
  const sortKey = searchParams?.sortKey || "createdAt"
  const sortDir = searchParams?.sortDir || "desc"
  const page = Number(searchParams?.page) || 1
  const limit = Number(searchParams?.limit) || 15

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
    ...(status !== "ALL" ? { status } : {})
  }

  // Get total count at the database level for pagination calculations
  const totalCount = await prisma.user.count({ where })

  // Fetch only the relevant paginated slice from the database
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      status: true,
      mfaEnabled: true,
      createdAt: true,
      _count: { select: { poems: true, reportsReceived: true } }
    },
    orderBy: { [sortKey]: sortDir },
    skip: (page - 1) * limit,
    take: limit
  })

  return (
    <AdminUsersClient 
      initialUsers={JSON.parse(JSON.stringify(users || []))} 
      currentUserRole={currentUser.role}
      totalCount={totalCount}
      currentPage={page}
      itemsPerPage={limit}
    />
  )
}
