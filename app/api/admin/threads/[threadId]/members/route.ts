import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
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
    const { agentId, historyGrantedFrom, historyGrantedTo } = body;

    const membership = await prisma.threadMembership.create({
      data: {
        threadId: params.threadId,
        userId: agentId,
        role: "admin",
        historyGrantedFrom: historyGrantedFrom ? new Date(historyGrantedFrom) : null,
        historyGrantedTo: historyGrantedTo ? new Date(historyGrantedTo) : null
      }
    });

    return NextResponse.json({ membership }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
