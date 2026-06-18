import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request, { params }: { params: { threadId: string } }) {
  try {
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

    const message = await prisma.message.create({
      data: {
        threadId: params.threadId,
        senderId: session.user.id,
        senderType: "user",
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
