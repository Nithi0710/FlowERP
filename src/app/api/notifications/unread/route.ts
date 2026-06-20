import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireAuth();
  const count = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });
  return NextResponse.json({ count });
}
