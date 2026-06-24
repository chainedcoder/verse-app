import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ threadId: string, agentId: string }> }) {
  const resolvedParams = await params;
  try {
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

    const membership = await prisma.threadMembership.findFirst({
      where: { threadId: resolvedParams.threadId, userId: resolvedParams.agentId }
    });

    if (!membership) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const updated = await prisma.threadMembership.update({
      where: { id: membership.id },
      data: { historyGrantedFrom: null, historyGrantedTo: null }
    });

    return NextResponse.json({ membership: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
