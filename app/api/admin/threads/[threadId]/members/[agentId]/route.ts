import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function DELETE(req: Request, { params }: { params: { threadId: string, agentId: string } }) {
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

    const membership = await prisma.threadMembership.findFirst({
      where: { threadId: params.threadId, userId: params.agentId, leftAt: null }
    });

    if (!membership) return NextResponse.json({ error: "Not Found" }, { status: 404 });

    const updated = await prisma.threadMembership.update({
      where: { id: membership.id },
      data: { leftAt: new Date() }
    });

    return NextResponse.json({ membership: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
