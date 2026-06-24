import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import SupportClient from "./SupportClient"

export const metadata = {
  title: "Support & Tickets | Verse"
}

export default async function SettingsSupportPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Fetch initial tickets where user is either the reporter or is CC'd (member of the thread)
  const tickets = await prisma.ticket.findMany({
    where: {
      OR: [
        { reporterId: session.user.id },
        {
          thread: {
            memberships: {
              some: {
                userId: session.user.id
              }
            }
          }
        }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: { thread: { include: { messages: true } } }
  });

  // Fetch initial live chats
  const liveChats = await prisma.thread.findMany({
    where: { 
      type: "LiveChat",
      memberships: { some: { userId: session.user.id } }
    },
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  });

  return (
    <div className="card" style={{ padding: "32px", minHeight: "60vh" }}>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", borderBottom: "1px solid var(--border-secondary)", paddingBottom: "12px" }}>Support & Tickets</h2>
      <SupportClient initialTickets={tickets} initialChats={liveChats} userId={session.user.id} />
    </div>
  )
}
