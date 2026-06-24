import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.logEvent.findMany({ where: { entityName: "Ticket" } });
  return NextResponse.json({ logs });
}
