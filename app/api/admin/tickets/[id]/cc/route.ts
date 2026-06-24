import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const isSuperAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "Super Administrator";
    const userPerms = (dbUser?.permissions as any) || (dbUser?.permissionGroup?.permissions as any) || {};
    const hasAccess = isSuperAdmin || dbUser?.role === "MODERATOR" || userPerms?.manageSupport === true || userPerms?.system?.length > 0 || userPerms?.user?.length > 0;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { userId } = body;

    if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { thread: true }
    });

    if (!ticket || !ticket.threadId) {
      return NextResponse.json({ error: "Ticket or thread not found" }, { status: 404 });
    }

    const threadMembership = await prisma.threadMembership.create({
      data: {
        threadId: ticket.threadId,
        userId: userId,
        role: "viewer"
      }
    });

    await prisma.logEvent.create({
      data: {
        operation: "User CC'd",
        actorId: session.user.id,
        entityName: "Ticket",
        changes: { ticketId: ticket.id, ccUserId: userId }
      }
    });

    return NextResponse.json({ success: true, threadMembership }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "User is already CC'd to this ticket" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
