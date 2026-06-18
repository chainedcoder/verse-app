import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ 
      where: { id: session.user.id },
      include: { permissionGroup: true }
    });
    
    const hasAccess = dbUser?.role === "ADMIN" || 
      (dbUser?.permissionGroup?.permissions as any)?.manageSystem === true;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const result = await prisma.logEvent.deleteMany({
      where: {
        timestamp: {
          lt: sixMonthsAgo
        }
      }
    });

    return NextResponse.json({ message: "Archived successfully", count: result.count }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
