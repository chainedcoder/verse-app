import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const isUser = dbUser?.role === "USER";
    const isSuperAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "Super Administrator";
    const userPerms = (dbUser?.permissions as any) || (dbUser?.permissionGroup?.permissions as any) || {};
    const hasAccess = isSuperAdmin || dbUser?.role === "MODERATOR" || userPerms?.manageSupport === true || userPerms?.system?.length > 0 || userPerms?.user?.length > 0 || isUser;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    const tickets = await prisma.ticket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(category ? { category } : {}),
        ...(isUser ? {
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
        } : {})
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        reporter: { select: { id: true, name: true, email: true } }, 
        assignee: { select: { id: true, name: true, email: true } },
        thread: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        }
      }
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const isUser = dbUser?.role === "USER";
    const hasAccess = dbUser?.role === "ADMIN" || 
      dbUser?.role === "MODERATOR" ||
      (dbUser?.permissionGroup?.permissions as any)?.manageSupport === true ||
      isUser;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { targetUserId, title, snippet, category, priority, requestType, assigneeId, entityType, entityId, entityName } = body;

    const actualTargetUserId = isUser ? session.user.id : targetUserId;
    if (!actualTargetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 });
    }

    const actualAssigneeId = isUser ? null : (assigneeId || session.user.id);

    const memberships = isUser ? [
      { userId: actualTargetUserId, role: "participant" }
    ] : [
      { userId: actualTargetUserId, role: "participant" },
      { userId: session.user.id, role: "admin" }
    ];

    const thread = await prisma.thread.create({
      data: {
        type: "Ticket",
        memberships: {
          create: memberships
        }
      }
    });

    const ticket = await prisma.ticket.create({
      data: {
        title,
        snippet,
        category,
        priority: priority || "Medium",
        requestType: requestType || "General",
        status: "Open",
        reporterId: actualTargetUserId,
        assigneeId: actualAssigneeId,
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
        changes: { ticketId: ticket.id, after: { id: ticket.id, title, status: ticket.status, reporterId: actualTargetUserId } }
      }
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

