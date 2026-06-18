import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import FinanceDashboardClient from "./FinanceDashboardClient"

export const metadata = {
  title: "Finance & Revenue — Admin",
}

export default async function FinancePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // Fetch real PostgreSQL platform stats
  const [totalUsers, premiumUsers, recentSubscribers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        NOT: { plan: "FREE" }
      }
    }),
    prisma.user.findMany({
      where: {
        NOT: { plan: "FREE" }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        plan: true,
        status: true,
        createdAt: true
      }
    })
  ])

  // Calculate actual Monthly Recurring Revenue
  const mrr = premiumUsers * 9.99 // Assuming Pro tier is $9.99/mo

  const stats = {
    totalUsers,
    premiumUsers,
    mrr
  }

  return (
    <FinanceDashboardClient stats={stats} recentSubscribers={recentSubscribers} />
  )
}
