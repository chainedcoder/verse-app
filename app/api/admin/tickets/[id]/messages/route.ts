import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const ticket = await prisma.ticket.findUnique({
      where: { id: params.id },
      include: { thread: true }
    });

    if (!ticket || !ticket.thread) {
      return NextResponse.json({ error: "Ticket or Thread not found" }, { status: 404 });
    }

    const isUser = dbUser?.role === "USER";
    const isReporter = ticket.reporterId === session.user.id;
    const isMember = await prisma.threadMembership.findFirst({
      where: { threadId: ticket.threadId, userId: session.user.id }
    });

    const isSuperAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "Super Administrator";
    const userPerms = (dbUser?.permissions as any) || (dbUser?.permissionGroup?.permissions as any) || {};
    const hasAccess = isSuperAdmin || dbUser?.role === "MODERATOR" || userPerms?.manageSupport === true || userPerms?.system?.length > 0 || userPerms?.user?.length > 0 || isReporter || !!isMember;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { content, parentId } = body;

    const senderType = isUser ? "user" : "agent";

    const message = await prisma.message.create({
      data: {
        threadId: ticket.thread.id,
        senderId: session.user.id,
        senderType,
        content,
        parentId
      }
    });

    // Automatically assign ticket to this admin if it's not assigned AND caller is NOT a normal user
    if (!ticket.assigneeId && !isUser) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { assigneeId: session.user.id }
      });
      await prisma.logEvent.create({
        data: {
          operation: "Ticket Assigned",
          actorId: session.user.id,
          entityName: "Ticket",
          changes: { ticketId: ticket.id, assigneeId: session.user.id, note: "Auto-assigned upon reply" }
        }
      });
    }

    await prisma.logEvent.create({
      data: {
        operation: isUser ? "User Replied" : "Agent Replied",
        actorId: session.user.id,
        entityName: "Ticket",
        changes: { ticketId: ticket.id, messageId: message.id }
      }
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
