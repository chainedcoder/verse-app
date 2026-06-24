import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const isUser = dbUser?.role === "USER";

    if (isUser) {
      if (ticket.reporterId !== session.user.id) {
        return NextResponse.json({ error: "Forbidden: You do not own this ticket." }, { status: 403 });
      }
      if (status !== "Resolved" && status !== "Closed") {
        return NextResponse.json({ error: "Users can only resolve or close tickets." }, { status: 400 });
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });

    // Create a progress log event
    await prisma.logEvent.create({
      data: {
        entityName: "Ticket",
        operation: "UPDATE",
        actorId: session.user.id,
        severity: "MEDIUM",
        changes: { ticketId: id, status, note: `Status changed to ${status}` }
      }
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return NextResponse.json({ error: "Failed to update ticket status" }, { status: 500 });
  }
}
