import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const hasAccess = dbUser?.role === "ADMIN" || 
      (dbUser?.permissionGroup?.permissions as any)?.manageSupport === true;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { status, assigneeId, priority, category } = body;

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    if (!ticket) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: { 
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
        ...(priority && { priority }),
        ...(category && { category })
      }
    });

    await prisma.logEvent.create({
      data: {
        entityName: "Ticket",
        operation: "UPDATE",
        actorId: session.user.id,
        severity: "MEDIUM",
        changes: { before: ticket, after: updatedTicket }
      }
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
