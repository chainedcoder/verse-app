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
    const type = searchParams.get("type"); // e.g. "LiveChat" or "Ticket"

    const threads = await prisma.thread.findMany({
      where: {
        ...(type ? { type } : {}),
        ...(isUser ? {
          memberships: {
            some: {
              userId: session.user.id
            }
          }
        } : {})
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    return NextResponse.json({ threads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
