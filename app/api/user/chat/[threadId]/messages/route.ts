import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, props: { params: Promise<{ threadId: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.threadMembership.findFirst({
      where: { threadId: params.threadId, userId: session.user.id }
    });

    if (!membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { content, parentId } = body;

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    const isAgent = dbUser?.role === "ADMIN" || dbUser?.role === "Super Administrator" || dbUser?.role === "MODERATOR" || (dbUser?.permissions as any)?.manageSupport === true || (dbUser?.permissionGroup?.permissions as any)?.manageSupport === true;
    const senderType = isAgent ? "agent" : "user";

    const message = await prisma.message.create({
      data: {
        threadId: params.threadId,
        senderId: session.user.id,
        senderType,
        content,
        parentId
      }
    });

    // Real-time integration would go here

    return NextResponse.json({ message }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
