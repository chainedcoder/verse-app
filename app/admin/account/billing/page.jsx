import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import BillingForm from "./BillingForm"

export default async function BillingPage({ searchParams }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect("/login")
  
  const isSuccess = searchParams?.success === 'true'

  return <BillingForm user={user} isSuccess={isSuccess} />
}
