import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      seeded: userCount > 0,
      userCount,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";
    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        message,
        hint: "Set DATABASE_URL in .env and run: npm run db:setup",
      },
      { status: 503 }
    );
  }
}
