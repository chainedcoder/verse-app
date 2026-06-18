import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ApiKeysForm from "./ApiKeysForm"

export default async function ApiKeysPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  return <ApiKeysForm apiKeys={apiKeys} />
}
