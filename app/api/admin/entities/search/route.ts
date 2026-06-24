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
    
    const isSuperAdmin = dbUser?.role === "ADMIN" || dbUser?.role === "Super Administrator";
    const userPerms = (dbUser?.permissions as any) || (dbUser?.permissionGroup?.permissions as any) || {};
    const hasAccess = isSuperAdmin || dbUser?.role === "MODERATOR" || userPerms?.manageSupport === true || userPerms?.system?.length > 0 || userPerms?.user?.length > 0;

    if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const model = searchParams.get("model");

    if (!q || !model) {
      return NextResponse.json({ entities: [] });
    }

    let entities: any[] = [];

    switch (model) {
      case "User":
        const users = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          },
          take: 10,
          select: { id: true, name: true, email: true }
        });
        entities = users.map(u => ({ id: u.id, name: u.name || u.email, detail: u.email }));
        break;

      case "Poem":
        const poems = await prisma.poem.findMany({
          where: {
            title: { contains: q, mode: "insensitive" }
          },
          take: 10,
          select: { id: true, title: true, author: { select: { name: true } } }
        });
        entities = poems.map(p => ({ id: p.id, name: p.title, detail: `By ${p.author?.name || 'Unknown'}` }));
        break;

      case "Comment":
        const comments = await prisma.comment.findMany({
          where: {
            content: { contains: q, mode: "insensitive" }
          },
          take: 10,
          select: { id: true, content: true, author: { select: { name: true } } }
        });
        entities = comments.map(c => ({ id: c.id, name: c.content.substring(0, 30) + '...', detail: `By ${c.author?.name || 'Unknown'}` }));
        break;

      case "Collection":
        const collections = await prisma.collection.findMany({
          where: {
            name: { contains: q, mode: "insensitive" }
          },
          take: 10,
          select: { id: true, name: true, user: { select: { name: true } } }
        });
        entities = collections.map(c => ({ id: c.id, name: c.name, detail: `By ${c.user?.name || 'Unknown'}` }));
        break;

      default:
        return NextResponse.json({ error: "Invalid model" }, { status: 400 });
    }

    return NextResponse.json({ entities });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
