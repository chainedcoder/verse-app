import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ConnectedAccountsForm from "./ConnectedAccountsForm"

export default async function ConnectedAccountsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { accounts: true }
  })

  if (!user) redirect("/login")

  return <ConnectedAccountsForm user={user} />
}
