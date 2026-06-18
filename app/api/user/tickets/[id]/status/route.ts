import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { status } = body;

    if (!["Resolved", "Closed"].includes(status)) {
      return NextResponse.json({ error: "Users can only resolve or close tickets." }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: params.id } });
    
    if (!ticket || ticket.reporterId !== session.user.id) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: params.id },
      data: { status }
    });

    await prisma.logEvent.create({
      data: {
        entityName: "Ticket",
        operation: "STATUS_CHANGE",
        actorId: session.user.id,
        severity: "MEDIUM",
        changes: { before: { status: ticket.status }, after: { status } }
      }
    });

    return NextResponse.json({ ticket: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
