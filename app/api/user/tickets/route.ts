import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, snippet, category, priority, requestType, entityType, entityId, entityName } = body;

    const thread = await prisma.thread.create({
      data: {
        type: "Ticket",
        memberships: {
          create: {
            userId: session.user.id,
            role: "participant"
          }
        }
      }
    });

    const ticket = await prisma.ticket.create({
      data: {
        title,
        snippet,
        category,
        priority: priority || "Low",
        requestType: requestType || "General",
        status: "Open",
        reporterId: session.user.id,
        threadId: thread.id,
        entityType,
        entityId,
        entityName
      }
    });

    await prisma.logEvent.create({
      data: {
        entityName: "Ticket",
        operation: "Ticket Created",
        actorId: session.user.id,
        severity: "LOW",
        changes: { ticketId: ticket.id, after: { id: ticket.id, title, status: ticket.status } }
      }
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

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
        ],
        ...(status ? { status } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: { thread: true }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
