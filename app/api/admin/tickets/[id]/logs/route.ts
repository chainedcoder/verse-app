import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id }
    });

    if (!ticket) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const isUser = dbUser?.role === "USER";
    const isReporter = ticket.reporterId === session.user.id;
    const isMember = await prisma.threadMembership.findFirst({
      where: { threadId: ticket.threadId, userId: session.user.id }
    });

    const isSuperAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "Super Administrator";
    const userPerms = (dbUser?.permissions as any) || (dbUser?.permissionGroup?.permissions as any) || {};
    const hasAccess = isSuperAdmin || dbUser?.role === "MODERATOR" || userPerms?.manageSupport === true || userPerms?.system?.length > 0 || userPerms?.user?.length > 0;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const allLogs = await prisma.logEvent.findMany({
      where: { entityName: "Ticket" },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { name: true, email: true } } }
    });

    const logs = allLogs.filter((l: any) => l.changes && l.changes.ticketId === params.id);

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
